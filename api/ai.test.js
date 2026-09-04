import { test } from 'node:test'
import assert from 'node:assert/strict'
import handler from './ai.js'

function mockReqRes({ method = 'POST', body = {}, headers = {} } = {}) {
  const req = { method, body, headers }
  const res = {
    statusCode: 200,
    _json: null,
    status(code) { this.statusCode = code; return this },
    json(payload) { this._json = payload; return this },
  }
  return { req, res }
}

test('rejects non-POST methods', async () => {
  const { req, res } = mockReqRes({ method: 'GET' })
  await handler(req, res)
  assert.equal(res.statusCode, 405)
})

test('returns 503 when GROQ_API_KEY is not set', async (t) => {
  const original = process.env.GROQ_API_KEY
  delete process.env.GROQ_API_KEY
  t.after(() => { if (original) process.env.GROQ_API_KEY = original })

  const { req, res } = mockReqRes({ body: { system: 'sys', message: 'hi' } })
  await handler(req, res)
  assert.equal(res.statusCode, 503)
})

test('rejects invalid body (missing message)', async (t) => {
  t.before(() => { process.env.GROQ_API_KEY = 'test-key' })
  const { req, res } = mockReqRes({ body: { system: 'sys' } })
  await handler(req, res)
  assert.equal(res.statusCode, 400)
})

test('calls Groq chat completions endpoint and returns text', async (t) => {
  process.env.GROQ_API_KEY = 'test-key'
  const originalFetch = global.fetch
  let capturedUrl, capturedBody
  global.fetch = async (url, opts) => {
    capturedUrl  = url
    capturedBody = JSON.parse(opts.body)
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'hello from groq' } }] }),
    }
  }
  t.after(() => { global.fetch = originalFetch })

  const { req, res } = mockReqRes({ body: { system: 'You are helpful', message: 'hi' } })
  await handler(req, res)

  assert.equal(res.statusCode, 200)
  assert.equal(res._json.text, 'hello from groq')
  assert.equal(capturedUrl, 'https://api.groq.com/openai/v1/chat/completions')
  assert.equal(capturedBody.messages[0].role, 'system')
  assert.equal(capturedBody.messages[1].role, 'user')
  assert.equal(capturedBody.messages[1].content, 'hi')
})

test('returns 502 when upstream errors', async (t) => {
  process.env.GROQ_API_KEY = 'test-key'
  const originalFetch = global.fetch
  global.fetch = async () => ({ ok: false, status: 500 })
  t.after(() => { global.fetch = originalFetch })

  const { req, res } = mockReqRes({ body: { system: 'sys', message: 'hi' } })
  await handler(req, res)
  assert.equal(res.statusCode, 502)
})

test('forwards the upstream explanation so a retired model is diagnosable', async (t) => {
  // Regression: Groq retired the pinned model and answered 404
  // model_not_found. The proxy replied with a bare 502, so every AI feature
  // failed identically and the cause was invisible.
  process.env.GROQ_API_KEY = 'test-key'
  const originalFetch = global.fetch
  global.fetch = async () => ({
    ok: false,
    status: 404,
    json: async () => ({ error: { message: 'The model `x` does not exist or you do not have access to it.' } }),
  })
  t.after(() => { global.fetch = originalFetch })

  const { req, res } = mockReqRes({ body: { system: 'sys', message: 'hi' } })
  await handler(req, res)
  assert.equal(res.statusCode, 502)
  assert.match(res._json.error, /does not exist/)
})

test('reports empty model output instead of returning a blank string', async (t) => {
  // Reasoning models can spend the whole token budget thinking and return 200
  // with content: "". Callers should not have to guess what that meant.
  process.env.GROQ_API_KEY = 'test-key'
  const originalFetch = global.fetch
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content: '   ' }, finish_reason: 'length' }] }),
  })
  t.after(() => { global.fetch = originalFetch })

  const { req, res } = mockReqRes({ body: { system: 'sys', message: 'hi' } })
  await handler(req, res)
  assert.equal(res.statusCode, 502)
  assert.match(res._json.error, /empty/i)
})

test('sends a reasoning_effort so reasoning does not eat the token budget', async (t) => {
  process.env.GROQ_API_KEY = 'test-key'
  let captured = null
  const originalFetch = global.fetch
  global.fetch = async (url, opts) => {
    captured = JSON.parse(opts.body)
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: 'ok' } }] }) }
  }
  t.after(() => { global.fetch = originalFetch })

  const { req, res } = mockReqRes({ body: { system: 'sys', message: 'hi' } })
  await handler(req, res)
  assert.equal(res.statusCode, 200)
  assert.equal(captured.reasoning_effort, 'low')
  assert.ok(captured.model, 'a model must be pinned')
})
