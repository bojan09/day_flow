export function remoteSuccess(value) {
  return { ok: true, value }
}

export function remoteFailure(error) {
  return {
    ok: false,
    error: error instanceof Error ? error : new Error(String(error ?? 'Remote operation failed')),
  }
}

export function resolveRemoteValue(cachedValue, result) {
  if (result.ok) return { value: result.value, stale: false }
  return { value: cachedValue, stale: true, error: result.error }
}
