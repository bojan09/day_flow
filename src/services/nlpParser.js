// Service: nlpParser
// Purpose: Parse natural language task input into structured task fields
// Example: "call dentist tomorrow at 2pm high priority work" -> { title, date, priority, category }
import { addDays, format, nextDay } from 'date-fns'

const PRIORITY_WORDS = { high: 'high', urgent: 'high', important: 'high', medium: 'medium', normal: 'medium', low: 'low', someday: 'low' }
const CATEGORY_WORDS = { work: 'Work', personal: 'Personal', health: 'Health', learning: 'Learning', finance: 'Finance' }

const DAY_NAMES = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0 }

function parseDate(text) {
  const lower = text.toLowerCase()
  const today = new Date()

  if (/\btoday\b/.test(lower))     return format(today, 'yyyy-MM-dd')
  if (/\btomorrow\b/.test(lower))  return format(addDays(today, 1), 'yyyy-MM-dd')
  if (/\bnext week\b/.test(lower)) return format(addDays(today, 7), 'yyyy-MM-dd')

  for (const [name, dayNum] of Object.entries(DAY_NAMES)) {
    if (lower.includes(name)) {
      const d = nextDay(today, dayNum)
      return format(d, 'yyyy-MM-dd')
    }
  }

  // Match "on the 15th" or "15th"
  const dateMatch = lower.match(/\b(\d{1,2})(st|nd|rd|th)?\b/)
  if (dateMatch) {
    const day = parseInt(dateMatch[1])
    if (day >= 1 && day <= 31) {
      const d = new Date(today.getFullYear(), today.getMonth(), day)
      if (d < today) d.setMonth(d.getMonth() + 1)
      return format(d, 'yyyy-MM-dd')
    }
  }

  return format(today, 'yyyy-MM-dd')
}

function parseEstimate(text) {
  const lower = text.toLowerCase()
  const hrMatch  = lower.match(/(\d+)\s*h(our)?/)
  const minMatch = lower.match(/(\d+)\s*m(in)?/)
  if (hrMatch)  return parseInt(hrMatch[1]) * 60
  if (minMatch) return parseInt(minMatch[1])
  return null
}

export function parseNLTask(input) {
  if (!input.trim()) return null
  let text     = input.trim()
  let priority = 'medium'
  let category = 'Personal'

  // Extract priority
  for (const [word, prio] of Object.entries(PRIORITY_WORDS)) {
    const re = new RegExp(`\\b${word}\\b`, 'i')
    if (re.test(text)) { priority = prio; text = text.replace(re, '').trim() }
  }

  // Extract category
  for (const [word, cat] of Object.entries(CATEGORY_WORDS)) {
    const re = new RegExp(`\\b${word}\\b`, 'i')
    if (re.test(text)) { category = cat; text = text.replace(re, '').trim() }
  }

  const date         = parseDate(text)
  const estimateMins = parseEstimate(text)

  // Strip date/time words from title
  const cleaned = text
    .replace(/\b(today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
    .replace(/\bat \d{1,2}(:\d{2})?\s*(am|pm)?\b/gi, '')
    .replace(/\b\d{1,2}(st|nd|rd|th)?\b/gi, '')
    .replace(/\b\d+\s*(h(our)?|m(in)?)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  return { title: cleaned || input.trim(), date, priority, category, estimateMins }
}
