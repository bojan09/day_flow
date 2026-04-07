// Component: DailyScore
// Purpose: Shows the day's report card — score, grade, and category breakdown
import Card from '../ui/Card'

const GRADE_COLORS = {
  'A+': 'text-forest-500 bg-forest-50 border-forest-200',
  'A':  'text-forest-500 bg-forest-50 border-forest-200',
  'B':  'text-blue-600   bg-blue-50   border-blue-200',
  'C':  'text-amber-600  bg-amber-50  border-amber-200',
  'D':  'text-orange-600 bg-orange-50 border-orange-200',
  'F':  'text-red-500    bg-red-50    border-red-200',
}

const BREAKDOWN_LABELS = {
  tasks:    { label: 'Tasks',     max: 35, emoji: '✅' },
  habits:   { label: 'Habits',    max: 30, emoji: '🔁' },
  mood:     { label: 'Mood',      max: 15, emoji: '😌' },
  gratitude:{ label: 'Gratitude', max: 10, emoji: '🙏' },
  water:    { label: 'Hydration', max: 10, emoji: '💧' },
}

export default function DailyScore({ scoreData }) {
  const { total, grade, message, breakdown } = scoreData

  return (
    <Card>
      <div className="flex items-center gap-4 mb-4">
        {/* Grade circle */}
        <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 ${GRADE_COLORS[grade]}`}>
          <span className="font-serif text-2xl font-bold">{grade}</span>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-0.5">Today's Score</p>
          <p className="font-serif text-3xl text-ink leading-none">{total}<span className="text-ink-faint text-lg">/100</span></p>
          <p className="text-xs text-ink-muted mt-1 italic">{message}</p>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="space-y-2">
        {Object.entries(breakdown).map(([key, val]) => {
          const meta = BREAKDOWN_LABELS[key]
          if (!meta) return null
          const pct = Math.round((val / meta.max) * 100)
          return (
            <div key={key}>
              <div className="flex justify-between mb-0.5">
                <span className="text-[11px] text-ink-muted flex items-center gap-1">
                  <span>{meta.emoji}</span>{meta.label}
                </span>
                <span className="text-[11px] text-ink-faint">{val}/{meta.max}</span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full">
                <div
                  className="h-full bg-forest-400 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
