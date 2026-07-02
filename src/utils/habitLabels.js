// Util: habitLabels
// Purpose: Fallback display name for habits saved icon-only (empty name).
//          Maps common emoji to a readable label so streaks stay identifiable.
const ICON_LABELS = {
  '🏃': 'Running',   '🚶': 'Walking',    '🏋️': 'Gym',       '💪': 'Strength',
  '🏊': 'Swimming',  '🚴': 'Cycling',    '🧘': 'Meditation', '💧': 'Water',
  '🛌': 'Sleep',     '💤': 'Rest',       '❤️': 'Health',     '🩺': 'Health',
  '📚': 'Reading',   '📖': 'Reading',    '🎓': 'Study',      '💡': 'Learning',
  '🧠': 'Focus',     '✍️': 'Writing',    '📝': 'Journaling', '🍎': 'Nutrition',
  '🥗': 'Eat well',  '☕': 'Coffee',     '🎯': 'Goal',       '🙏': 'Gratitude',
  '🎨': 'Creative',  '🎵': 'Music',      '💻': 'Work',       '🌱': 'Growth',
}

export function habitDisplayName(habit) {
  if (habit?.name && habit.name.trim()) return habit.name
  return ICON_LABELS[habit?.icon] || 'Habit'
}
