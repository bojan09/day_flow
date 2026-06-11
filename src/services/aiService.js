// Service: aiService
// Purpose: Single entry point for all AI calls. Talks to the /api/ai
//          serverless proxy so the Anthropic API key never reaches the
//          client. All 7 AI features import callClaude from here.

/**
 * Send a prompt to Claude via the server-side proxy.
 * @param {string} systemPrompt - System instruction
 * @param {string} userMessage  - User content
 * @returns {Promise<string>}   - Model text response
 * @throws {Error} with a user-friendly message on failure
 */
export async function callClaude(systemPrompt, userMessage) {
  let response
  try {
    response = await fetch('/api/ai', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ system: systemPrompt, message: userMessage }),
    })
  } catch {
    throw new Error('AI is unreachable — check your connection')
  }

  if (!response.ok) {
    let detail = ''
    try { detail = (await response.json()).error || '' } catch { /* ignore */ }
    if (response.status === 404) {
      throw new Error('AI requires the deployed app (the /api proxy is not available in plain `vite dev` — use `vercel dev` locally)')
    }
    throw new Error(detail || `AI error ${response.status}`)
  }

  const data = await response.json()
  return data.text || ''
}
