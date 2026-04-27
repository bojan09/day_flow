// Component: HabitPairingSuggestion
// Purpose: Suggests pairing a new habit with an existing one using simple rule-based logic
const PAIRING_TIPS = {
  '🏃': ['📚', '🧘', '💧'],
  '🧘': ['📚', '✍️', '🎵'],
  '📚': ['✍️', '🎯', '💡'],
  '💪': ['🥗', '💧', '😴'],
  '💧': ['🥗', '💊', '🏃'],
  '😴': ['🧘', '📚', '✍️'],
}

const PAIRING_MESSAGES = [
  'People who do {a} also tend to do {b} right after.',
  'Stack {b} onto {a} — they complement each other naturally.',
  'A great habit pair: {a} + {b}.',
]

export default function HabitPairingSuggestion({ habits, newHabitIcon }) {
  if (!newHabitIcon || habits.length === 0) return null

  const suggestedIcons = PAIRING_TIPS[newHabitIcon] || []
  const matchedHabit   = habits.find(h => suggestedIcons.includes(h.icon))

  if (!matchedHabit) return null

  const msg = PAIRING_MESSAGES[Math.floor(Math.random() * PAIRING_MESSAGES.length)]
    .replace('{a}', matchedHabit.name)
    .replace('{b}', 'your new habit')

  return (
    <div className="flex items-start gap-2.5 p-3 [background-color:var(--accent-light)] border border-forest-100 rounded-xl">
      <span className="text-base mt-0.5">💡</span>
      <p className="text-xs [color:var(--accent)] leading-relaxed">{msg}</p>
    </div>
  )
}
