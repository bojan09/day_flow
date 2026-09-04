// API: /api/ai
// Purpose: Server-side proxy for Groq API calls (OpenAI-compatible chat
//          completions). The API key lives only in the GROQ_API_KEY env var
//          on Vercel — never in the client bundle. Validates input, pins
//          model + token limits server-side, and applies a best-effort
//          per-IP rate limit tuned to Groq's free tier.

// Groq retires models without warning. llama-3.3-70b-versatile was pinned here
// and silently stopped existing — Groq answered 404 model_not_found, this proxy
// turned that into a bare 502, and every AI feature in the app broke with no
// way to tell why. If AI stops working, check GET /v1/models first, and read
// the upstream detail this handler now forwards.
const MODEL      = 'openai/gpt-oss-120b'
const MAX_TOKENS = 1000
// gpt-oss models emit reasoning tokens that come out of the same budget. At
// default effort a short answer can spend the whole allowance on reasoning and
// return empty content, so keep it low for these short, structured replies.
const REASONING_EFFORT = 'low'

const WINDOW_MS = 60 * 1000
const LIMIT     = 30
const hits      = new Map()

function rateLimited(ip) {
  const now  = Date.now()
  const past = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS)
  if (past.length >= LIMIT) { hits.set(ip, past); return true }
  past.push(now)
  hits.set(ip, past)
  return false
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const key = process.env.GROQ_API_KEY
  if (!key) {
    return res.status(503).json({ error: 'AI is not configured on this deployment' })
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many AI requests — try again in a minute' })
  }

  const { system, message } = req.body || {}
  if (typeof system !== 'string' || typeof message !== 'string' ||
      !system.trim() || !message.trim() ||
      system.length > 8000 || message.length > 24000) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  try {
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model:            MODEL,
        max_tokens:       MAX_TOKENS,
        reasoning_effort: REASONING_EFFORT,
        messages: [
          { role: 'system', content: system },
          { role: 'user',   content: message },
        ],
      }),
    })

    if (!upstream.ok) {
      // Forward Groq's own explanation. Without it a retired model, a revoked
      // key and a rate limit all look identical from the client. Groq error
      // messages describe the request, never the credential.
      let detail = ''
      try {
        const body = await upstream.json()
        detail = body?.error?.message || ''
      } catch { /* non-JSON error body */ }
      console.error(`[DayFlow] Groq ${upstream.status} for model ${MODEL}: ${detail}`)
      return res.status(502).json({
        error: detail
          ? `AI service error (${upstream.status}): ${String(detail).slice(0, 200)}`
          : `AI service error (${upstream.status})`,
      })
    }

    const data = await upstream.json()
    const text = data.choices?.[0]?.message?.content || ''
    if (!text.trim()) {
      // A reasoning model that spends its whole budget thinking returns 200
      // with empty content. Say so rather than handing back a blank string
      // that each caller has to guess about.
      console.error(`[DayFlow] Groq returned empty content (finish: ${data.choices?.[0]?.finish_reason})`)
      return res.status(502).json({ error: 'AI returned an empty response — try again' })
    }
    return res.status(200).json({ text })
  } catch {
    return res.status(502).json({ error: 'AI service unreachable' })
  }
}
