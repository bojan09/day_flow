// Component: TimeBlockView
// Purpose: Hourly day timeline — drag tasks onto time slots for visual scheduling
import { useState } from 'react'
import Card from '../ui/Card'
import { getTodayKey } from '../../utils/dateUtils'
import { storage } from '../../services/storage'

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6) // 6am–9pm

function formatHour(h) {
  if (h === 12) return '12pm'
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

export default function TimeBlockView({ tasks }) {
  const storageKey            = `timeblocks_${getTodayKey()}`
  const [blocks, setBlocks]   = useState(() => storage.get(storageKey, {}))
  const [dragging, setDragging] = useState(null)

  const todayTasks = tasks.getTodayTasks()

  const saveBlocks = (next) => {
    setBlocks(next)
    storage.set(storageKey, next)
  }

  const assignBlock = (hour, taskId) => {
    const next = { ...blocks }
    // Remove task from any existing slot
    Object.keys(next).forEach(h => { if (next[h] === taskId) delete next[h] })
    if (taskId) next[hour] = taskId
    saveBlocks(next)
  }

  const clearSlot = (hour) => {
    const next = { ...blocks }
    delete next[hour]
    saveBlocks(next)
  }

  const unscheduled = todayTasks.filter(
    t => !Object.values(blocks).includes(t.id)
  )

  return (
    <div className="max-w-2xl mx-auto pt-2 space-y-4">
      <p className="text-sm text-ink-muted">Drag tasks onto time slots to schedule your day.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Unscheduled tasks */}
        <div className="md:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-2">Unscheduled</p>
          <div className="space-y-1.5">
            {unscheduled.length === 0 && (
              <p className="text-xs text-ink-faint italic py-2">All tasks are scheduled 🎉</p>
            )}
            {unscheduled.map(t => (
              <div
                key={t.id}
                draggable
                onDragStart={() => setDragging(t.id)}
                onDragEnd={() => setDragging(null)}
                className={`px-3 py-2 rounded-xl border text-sm cursor-grab active:cursor-grabbing select-none transition-all ${
                  t.completed
                    ? 'bg-stone-50 border-stone-100 text-ink-faint line-through'
                    : 'bg-white border-stone-200 text-ink hover:border-forest-300 hover:shadow-sm'
                }`}
              >
                <span className="truncate block">{t.title}</span>
                {t.estimateMins && (
                  <span className="text-[10px] text-ink-faint">
                    ⏱ {t.estimateMins < 60 ? `${t.estimateMins}m` : `${t.estimateMins / 60}h`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="md:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-2">Timeline</p>
          <Card noPad>
            {HOURS.map(hour => {
              const taskId  = blocks[hour]
              const task    = todayTasks.find(t => t.id === taskId)
              const isNow   = new Date().getHours() === hour

              return (
                <div
                  key={hour}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => { if (dragging) assignBlock(hour, dragging); setDragging(null) }}
                  className={`flex items-center gap-3 px-4 py-2.5 border-b border-stone-50 last:border-0 transition-colors ${
                    dragging ? 'hover:bg-forest-50' : ''
                  } ${isNow ? 'bg-forest-50/50' : ''}`}
                >
                  <span className={`text-xs w-10 flex-shrink-0 font-medium ${isNow ? 'text-forest-600' : 'text-ink-faint'}`}>
                    {formatHour(hour)}
                  </span>
                  {isNow && <div className="w-1.5 h-1.5 rounded-full bg-forest-500 flex-shrink-0" />}

                  {task ? (
                    <div className={`flex-1 flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg ${
                      task.completed ? 'bg-stone-100' : 'bg-forest-100 border border-forest-200'
                    }`}>
                      <span className={`text-sm truncate ${task.completed ? 'line-through text-ink-faint' : 'text-forest-800'}`}>
                        {task.title}
                      </span>
                      <button
                        onClick={() => clearSlot(hour)}
                        className="text-[10px] text-forest-400 hover:text-red-400 transition-colors flex-shrink-0"
                      >✕</button>
                    </div>
                  ) : (
                    <div className="flex-1 border border-dashed border-stone-200 rounded-lg h-8 flex items-center px-3">
                      <span className="text-xs text-stone-300">Drop task here</span>
                    </div>
                  )}
                </div>
              )
            })}
          </Card>
        </div>
      </div>
    </div>
  )
}
