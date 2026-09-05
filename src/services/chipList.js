// Service: chipList
// Purpose: Multi-select chip answers stored as one comma-separated string.
//
// Kept as a string rather than an array so entries written when these were
// single-select still load, and so every existing reader (summaries, the
// evening facts block, reflectionModel's merge) keeps working untouched.

/** "a, b" -> ["a","b"]. Tolerates a plain single value and empty input. */
export function parseList(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

export function formatList(items) {
  return parseList(items).join(', ')
}

/** Add or remove one option, preserving the order they were picked in. */
export function toggleInList(value, option) {
  const items = parseList(value)
  const i = items.indexOf(option)
  if (i >= 0) items.splice(i, 1)
  else items.push(option)
  return items.join(', ')
}

export function listHas(value, option) {
  return parseList(value).includes(option)
}

/** Anything the user typed that is not one of the presets. */
export function customPart(value, options) {
  return parseList(value).filter(v => !options.includes(v)).join(', ')
}

/** Replace the free-text portion, keeping the chosen presets. */
export function setCustomPart(value, options, text) {
  const presets = parseList(value).filter(v => options.includes(v))
  const custom  = parseList(text)
  return [...presets, ...custom].join(', ')
}
