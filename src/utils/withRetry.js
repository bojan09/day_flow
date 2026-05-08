// Utility: withRetry
// Purpose: Wraps an async operation with exponential backoff retry logic.
//          Used by data hooks to automatically retry failed Supabase writes.
//          After maxRetries, reports failure to the toast system.

/**
 * @param {Function} fn       — async function to retry
 * @param {Object}   options
 *   @param {number} maxRetries    — default 3
 *   @param {number} baseDelay    — ms, doubles each attempt (default 500)
 *   @param {string} errorMessage — shown to user if all retries fail
 *   @param {Function} onFail     — called after all retries exhausted
 */
export async function withRetry(fn, {
  maxRetries    = 3,
  baseDelay     = 500,
  errorMessage  = 'Save failed — please check your connection',
  onFail        = null,
} = {}) {
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < maxRetries) {
        // Exponential backoff: 500ms, 1000ms, 2000ms
        await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)))
      }
    }
  }

  // All retries exhausted
  console.error('[DayFlow] Write failed after retries:', lastError?.message)
  onFail?.(errorMessage, lastError)
  return null
}
