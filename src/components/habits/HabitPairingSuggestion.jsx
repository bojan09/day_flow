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

  // Keyed off the matched habit rather than Math.random() during render, which
  // picked a different message on every re-render and made the tip flicker.
  const msgIndex = matchedHabit.id
    ? [...String(matchedHabit.id)].reduce((n, c) => n + c.charCodeAt(0), 0) % PAIRING_MESSAGES.length
    : 0
  const msg = PAIRING_MESSAGES[msgIndex]
    .replace('{a}', matchedHabit.name)
    .replace('{b}', 'your new habit')

  return (
    <div className="flex items-start gap-2.5 p-3 [background-color:var(--accent-light)] border [border-color:var(--border)] rounded-xl">
      <span className="text-base mt-0.5">💡</span>
      <p className="text-xs [color:var(--accent-text)] leading-relaxed">{msg}</p>
    </div>
  )
}
