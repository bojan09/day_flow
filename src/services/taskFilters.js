export function taskMatchesFilter(task, filter, todayKey) {
  if (filter === 'Today') return task.date === todayKey && !task.completed
  if (filter === 'Overdue') return task.date < todayKey && !task.completed
  if (filter === 'Pending') return !task.completed
  if (filter === 'Done') return task.completed
  return true
}
