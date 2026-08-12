export function normalizeDailyPriorities(ids, tasks) {
  const available = new Set((tasks ?? []).filter(task => !task.completed).map(task => String(task.id)))
  return [...new Set((ids ?? []).map(String))].filter(id => available.has(id)).slice(0, 3)
}
