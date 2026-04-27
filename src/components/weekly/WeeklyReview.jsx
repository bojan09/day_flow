// Component: WeeklyReview
// Purpose: Sunday weekly review modal — week stats, mood avg, streak, next-week intention
import { useState } from 'react'
import { subDays } from 'date-fns'
import { MOODS } from '../../hooks/useMood'
import { getDateKey } from '../../utils/dateUtils'

const isSunday = () => new Date().getDay() === 0

export default function WeeklyReview({ tasks, habits, mood }) {
  const [dismissed, setDismissed] = useState(false)
  const [next,      setNext]      = useState('')
  const [saved,     setSaved]     = useState(false)

  if (!isSunday() || dismissed) return null

  const last7     = Array.from({ length: 7 }, (_, i) => getDateKey(subDays(new Date(), i)))
  const weekTasks = tasks.tasks.filter(t => last7.includes(t.date))
  const completed = weekTasks.filter(t => t.completed).length
  const history   = mood.getHistory(7)
  const avgMood   = history.length
    ? (history.reduce((s, m) => s + m.score, 0) / history.length).toFixed(1)
    : '—'
  const topEmoji  = history[0] ? MOODS.find(m => m.score === history[0].score)?.emoji : '😐'
  const bestStreak = habits.getMaxStreak()

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/30 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="[background-color:var(--surface)] w-full sm:max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="[background-color:var(--accent)] px-6 py-5">
          <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">Weekly Review</p>
          <h2 className="font-serif text-2xl text-white">How was your week? 🌿</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tasks done',  val: `${completed}/${weekTasks.length}` },
              { label: 'Avg mood',    val: `${avgMood} ${topEmoji}` },
              { label: 'Best streak', val: `${bestStreak}🔥` },
            ].map(s => (
              <div key={s.label} className="[background-color:var(--bg)] rounded-xl p-3 text-center">
                <p className="font-serif text-lg [color:var(--text)]">{s.val}</p>
                <p className="text-[10px] [color:var(--text-faint)] uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          {!saved ? (
            <div className="space-y-2">
              <p className="text-xs font-medium [color:var(--text-muted)] uppercase tracking-wider">Next week I want to…</p>
              <textarea
                value={next}
                onChange={e => setNext(e.target.value)}
                placeholder="Set your intention for next week..."
                rows={2}
                className="w-full text-sm [background-color:var(--bg)] border [border-color:var(--border)] rounded-xl px-3 py-2 outline-none resize-none focus:ring-2 focus:ring-forest-200 [color:var(--text)] placeholder-ink-faint/50"
              />
              <button onClick={() => setSaved(true)} className="w-full py-2.5 rounded-xl [background-color:var(--accent)] text-white text-sm font-medium hover:[background-color:var(--accent)] transition-colors">
                Save & Close
              </button>
              <button onClick={() => setDismissed(true)} className="w-full text-xs [color:var(--text-faint)] hover:[color:var(--text)] text-center transition-colors py-1">
                Skip for now
              </button>
            </div>
          ) : (
            <div className="text-center py-3 space-y-2">
              <p className="text-sm [color:var(--accent)] font-medium">✓ Great week — on to the next one!</p>
              <button onClick={() => setDismissed(true)} className="text-xs [color:var(--text-faint)] hover:[color:var(--text)] transition-colors">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
