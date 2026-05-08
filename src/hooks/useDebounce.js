// Hook: useDebounce
// Purpose: Returns a debounced version of a value — only updates after the
//          specified delay has passed without further changes.
//          Used to batch rapid user actions (water taps, note edits) into single writes.
import { useState, useEffect } from 'react'

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// Hook: useDebouncedCallback
// Purpose: Returns a debounced callback function.
//          Calling it rapidly will only fire the real function once after the delay.
import { useRef, useCallback } from 'react'

export function useDebouncedCallback(fn, delay = 500) {
  const timerRef = useRef(null)

  return useCallback((...args) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}
