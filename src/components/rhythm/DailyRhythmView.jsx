// Component: DailyRhythmView
// Purpose: Single "Daily Rhythm" destination replacing 2 separate nav entries
//          (Habits/Routines). Each keeps its own data hook/CRUD/streak/run-mode
//          logic entirely unchanged — this is a routing/shell consolidation
//          only, not a data-model merge. Unlike CaptureView's tab-switcher
//          (which hides 3 of 4 types behind a click), both sections here are
//          always visible at once — stacked, clearly labeled sections.
import HabitsView   from '../habits/HabitsView'
import RoutinesView from '../routines/RoutinesView'
import { useHabitRules } from '../../hooks/useHabitRules'

// habitRules is owned here rather than at the DashboardPage root — this is its
// only consumer, so hoisting it loaded rules on every session regardless of
// whether this tab was ever opened.
export default function DailyRhythmView({ habits, routines }) {
  const habitRules = useHabitRules()
  return (
    <div className="pt-2 space-y-8">
      <section>
        <h2
          className="max-w-2xl mx-auto px-1 mb-2 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-faint)' }}
        >
          🔁 Habits
        </h2>
        <HabitsView habits={habits} habitRules={habitRules} />
      </section>

      <section>
        <h2
          className="max-w-lg mx-auto px-1 mb-2 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-faint)' }}
        >
          🌅 Routines
        </h2>
        <RoutinesView routines={routines} />
      </section>
    </div>
  )
}
