// Component: ReflectionPrompt
// Purpose: Shows a rotating daily reflection prompt to encourage journaling
import { useState } from 'react'
import Card from '../ui/Card'

const PROMPTS = [
  "What's one thing you want to accomplish more than anything else today?",
  "What would make today feel like a win?",
  "What's something you've been putting off that you can tackle today?",
  "Who could you reach out to today that would brighten their day?",
  "What habit or action, done consistently this week, would change everything?",
  "What are you most grateful for right now?",
  "What's one small thing you can do today toward your biggest goal?",
  "What drained you yesterday, and how can you protect your energy today?",
  "If you could only do three things today, what would they be?",
  "What would your future self thank you for doing today?",
  "What's been on your mind lately that deserves some attention?",
  "What does a truly successful day look like for you?",
]

function getDailyPrompt() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return PROMPTS[dayOfYear % PROMPTS.length]
}

export default function ReflectionPrompt({ onWriteNote }) {
  const [prompt] = useState(getDailyPrompt)
  const [idx, setIdx]       = useState(PROMPTS.indexOf(prompt))

  const next = () => setIdx(i => (i + 1) % PROMPTS.length)

  return (
    <Card className="[background-color:var(--accent-light)] [border-color:var(--border)]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-xs font-medium uppercase tracking-wider [color:var(--accent)]">Daily Reflection</p>
        <button
          onClick={next}
          className="text-xs [color:var(--accent)] hover:[color:var(--accent)] transition-colors flex-shrink-0"
          title="Next prompt"
        >
          ↻ New
        </button>
      </div>
      <p className="font-serif text-base [color:var(--accent)] leading-relaxed italic mb-4">
        "{PROMPTS[idx]}"
      </p>
      <button
        onClick={() => onWriteNote(PROMPTS[idx])}
        className="text-xs font-medium [color:var(--accent)] hover:[color:var(--accent)] transition-colors flex items-center gap-1"
      >
        ✍️ Write about this →
      </button>
    </Card>
  )
}
