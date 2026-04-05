// Service: Thin localStorage wrapper with JSON serialization
const PREFIX = 'dayflow_'

export const storage = {
  get: (key, fallback = null) => {
    try {
      const item = localStorage.getItem(PREFIX + key)
      return item ? JSON.parse(item) : fallback
    } catch {
      return fallback
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.error('[DayFlow] Storage write failed:', e)
    }
  },

  remove: (key) => localStorage.removeItem(PREFIX + key),
}
