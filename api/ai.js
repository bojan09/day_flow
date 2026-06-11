// API: /api/ai
// Purpose: Server-side proxy for Anthropic API calls. The API key lives only
//          in the ANTHROPIC_API_KEY env var on Vercel — never in the client
//          bundle. Validates input, pins model + token limits server-side,
//          and applies a best-effort per-IP rate limit.

const MODEL      = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 1000

// Best-effort in-memory rate limit (per warm serverless instance):
// 20 requests per IP per 5 minutes.
const WINDOW_MS = 5 * 60 * 1000
const LIMIT     = 20
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

  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    return res.status(503).json({ error: 'AI is not configured on this deployment' })
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many AI requests — try again in a few minutes' })
  }

  const { system, message } = req.body || {}
  if (typeof system !== 'string' || typeof message !== 'string' ||
      !system.trim() || !message.trim() ||
      system.length > 8000 || message.length > 24000) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages: [{ role: 'user', content: message }],
      }),
    })

    if (!upstream.ok) {
      return res.status(502).json({ error: `AI service error (${upstream.status})` })
    }

    const data = await upstream.json()
    const text = data.content?.[0]?.text || ''
    return res.status(200).json({ text })
  } catch {
    return res.status(502).json({ error: 'AI service unreachable' })
  }
}
