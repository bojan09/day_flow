// Component: OverdueRescue
// Purpose: Smart banner when overdue tasks exist — one-tap reschedule to today or tomorrow
import { useState } from 'react'
import { format, addDays } from 'date-fns'
import { getTodayKey } from '../../utils/dateUtils'

export default function OverdueRescue({ tasks }) {
  const [dismissed, setDismissed] = useState(false)
  const overdue = tasks.tasks.filter(t => tasks.isOverdue(t))

  if (overdue.length === 0 || dismissed) return null

  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const today    = getTodayKey()

  const rescheduleAll = (date) => {
    overdue.forEach(t => tasks.updateTask(t.id, { date }))
    setDismissed(true)
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-red-500 text-sm">⚠️</span>
          <p className="text-sm font-semibold text-red-700">
            {overdue.length} overdue task{overdue.length !== 1 ? 's' : ''}
          </p>
        </div>
        <p className="text-xs text-red-500 truncate">
          {overdue.map(t => t.title).join(' · ')}
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0 flex-wrap">
        <button
          onClick={() => rescheduleAll(today)}
          className="px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
        >
          Move to today
        </button>
        <button
          onClick={() => rescheduleAll(tomorrow)}
          className="px-3 py-1.5 rounded-full bg-white border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
        >
          Move to tomorrow
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-red-300 hover:text-red-400 text-xs p-1.5 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
