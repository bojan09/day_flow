// Component: TodayHabitStrip
// Purpose: Mini habit checklist for today shown on the Today tab
import Card from '../ui/Card'

export default function TodayHabitStrip({ habits }) {
  const { habits: list, isHabitDone, toggleHabitDay } = habits

  return (
    <Card noPad>
      <div className="px-5 pt-4 pb-3 border-b border-stone-50 flex items-center justify-between">
        <h3 className="font-serif text-base text-ink">Habits Today</h3>
        <span className="text-xs text-ink-faint">{list.filter(h => isHabitDone(h.id)).length}/{list.length}</span>
      </div>
      {list.length === 0 ? (
        <p className="px-5 py-5 text-sm text-ink-faint italic text-center">Add habits in the Habits tab</p>
      ) : (
        <ul className="divide-y divide-stone-50">
          {list.map(h => {
            const done = isHabitDone(h.id)
            return (
              <li key={h.id} className="flex items-center gap-3 px-5 py-2.5">
                <button
                  onClick={() => toggleHabitDay(h.id)}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs transition-all ${
                    done ? 'bg-forest-500 border-forest-500 text-white' : 'border-stone-300 hover:border-forest-400'
                  }`}
                >
                  {done && '✓'}
                </button>
                <span className="text-base">{h.icon}</span>
                <span className={`text-sm flex-1 ${done ? 'line-through text-ink-faint' : 'text-ink'}`}>{h.name}</span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
