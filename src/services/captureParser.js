const PREFIX_TYPES = { '!': 'task', '?': 'idea', '"': 'note', '#': 'inbox' }
const PRIORITIES = { urgent: 'high', important: 'high', high: 'high', medium: 'medium', normal: 'medium', low: 'low' }
const CATEGORIES = { work: 'Work', personal: 'Personal', health: 'Health', learning: 'Learning', finance: 'Finance' }
const WEEKDAYS = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }

const formatDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

function nextWeekday(now, target) {
  const date = new Date(now)
  const delta = (target - date.getDay() + 7) % 7 || 7
  date.setDate(date.getDate() + delta)
  return date
}

function parseTime(text) {
  const match = text.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i)
  if (!match || (!match[2] && !match[3] && !/\bat\s+/i.test(match[0]))) return null
  let hour = Number(match[1]); const minute = Number(match[2] ?? 0); const period = match[3]?.toLowerCase()
  if (hour > 23 || minute > 59 || (period && hour > 12)) return null
  if (period === 'pm' && hour < 12) hour += 12
  if (period === 'am' && hour === 12) hour = 0
  if (!period && !match[2] && hour >= 1 && hour <= 7) hour += 12
  return { value: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, raw: match[0] }
}

export function parseCapture(input, explicitType = null, now = new Date()) {
  let text = String(input ?? '').trim()
  if (!text) throw new Error('Capture cannot be blank')
  const prefixType = PREFIX_TYPES[text[0]]
  const type = explicitType || prefixType || 'task'
  if (prefixType) text = text.slice(1).trim()

  const fields = {}
  let confidence = explicitType || prefixType ? 1 : 0.7
  let working = text

  const lower = working.toLowerCase()
  let date = new Date(now)
  if (/\btomorrow\b/i.test(working)) { date.setDate(date.getDate() + 1); working = working.replace(/\btomorrow\b/i, ''); confidence += 0.1 }
  else if (/\btoday\b/i.test(working)) { working = working.replace(/\btoday\b/i, ''); confidence += 0.1 }
  else {
    const weekday = Object.keys(WEEKDAYS).find(day => new RegExp(`\\b${day}\\b`, 'i').test(working))
    if (weekday) { date = nextWeekday(now, WEEKDAYS[weekday]); working = working.replace(new RegExp(`\\b${weekday}\\b`, 'i'), ''); confidence += 0.1 }
  }

  const time = parseTime(working)
  if (time) { fields.dueTime = time.value; working = working.replace(time.raw, ''); confidence += 0.1 }
  const duration = working.match(/\b(\d+)\s*(hours?|hrs?|minutes?|mins?)\b/i)
  if (duration) {
    fields.estimateMins = Number(duration[1]) * (/^h/i.test(duration[2]) ? 60 : 1)
    working = working.replace(duration[0], '')
  }
  for (const [word, priority] of Object.entries(PRIORITIES)) {
    const regex = new RegExp(`\\b${word}(?:\\s+priority)?\\b`, 'i')
    if (regex.test(working)) { fields.priority = priority; working = working.replace(regex, ''); break }
  }
  for (const [word, category] of Object.entries(CATEGORIES)) {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    if (regex.test(working)) { fields.category = category; working = working.replace(regex, ''); break }
  }

  fields.title = working.replace(/\s{2,}/g, ' ').trim() || text
  fields.date = formatDate(date)
  fields.priority ??= 'medium'
  fields.category ??= 'Personal'
  if (type === 'reminder') fields.reminderTime = fields.dueTime ?? ''
  if (['note', 'idea', 'inbox'].includes(type)) fields.text = text
  return { type, text, fields, confidence: Math.min(confidence, 1) }
}
