// Utils: Date formatting, parsing, and week generation helpers
import { format, startOfWeek, addDays } from 'date-fns'

export const formatDate      = (date) => format(new Date(date), 'EEEE, MMMM d')
export const formatShortDate = (date) => format(new Date(date), 'MMM d')
export const getTodayKey     = ()     => format(new Date(), 'yyyy-MM-dd')
export const getDateKey      = (date) => format(new Date(date), 'yyyy-MM-dd')

/** Returns an array of 7 Date objects for the current week (Mon–Sun) */
export const getWeekDays = (date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}
