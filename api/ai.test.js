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
