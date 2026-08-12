export function buildRecoveryQueue({ tasks = [], habits = [], routines = [], today }) {
  const taskItems = tasks.filter(task => !task.completed && task.date && task.date < today).sort((a,b) => a.date.localeCompare(b.date) || String(a.id).localeCompare(String(b.id))).map(task => ({ ...task, type: 'task', overdue: true }))
  const habitItems = habits.filter(habit => habit.missed).map(habit => ({ ...habit, type: 'habit', overdue: false }))
  const routineItems = routines.filter(routine => (routine.completion ?? 100) < 100).map(routine => ({ ...routine, type: 'routine', overdue: false }))
  return [...taskItems, ...habitItems, ...routineItems]
}
export function shouldOfferRecovery(queue) {
  const overdue = queue.filter(item => item.type === 'task' && item.overdue).length
  return overdue >= 3 || (overdue >= 1 && queue.length >= 4)
}
