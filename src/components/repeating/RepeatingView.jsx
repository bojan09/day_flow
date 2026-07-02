// Component: RepeatingView
// Purpose: Central management page for every recurring item (tasks, workouts, …).
//          Filter by type / frequency / status, search, pause, edit, stop.
import { useState, useMemo } from 'react'
import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'
import RepeatingItemRow from './RepeatingItemRow'
import RecurrencePanel from '../tasks/RecurrencePanel'
import { useRepeatingItems } from '../../hooks/useRepeatingItems'

const TYPE_FILTERS = ['All', 'Task', 'Workout']
const STATUS_FILTERS = ['All', 'Active', 'Paused']
const FREQ_FILTERS = ['All', 'Daily', 'Weekly', 'Monthly', 'Custom']

export default function RepeatingView({ tasks, workouts }) {
  const items = useRepeatingItems(tasks, workouts)

  const [typeF,   setTypeF]   = useState('All')
  const [statusF, setStatusF] = useState('All')
  const [freqF,   setFreqF]   = useState('All')
  const [query,   setQuery]   = useState('')
  const [editTask, setEditTask] = useState(null)   // task RecurrencePanel target

  const filtered = useMemo(() => items.filter(it => {
    if (typeF !== 'All' && it.type !== typeF.toLowerCase()) return false
    if (statusF !== 'All' && it.status !== statusF.toLowerCase()) return false
    if (freqF !== 'All' && it.frequency !== freqF) return false
    if (query.trim() && !it.name.toLowerCase().includes(query.toLowerCase())) return false
    return true
  }), [items, typeF, statusF, freqF, query])

  const togglePause = (item) => {
    const next = item.status === 'active' ? 'paused' : 'active'
    if (item.type === 'task')    tasks.updateTask(item.sourceId, { recurStatus: next })
    if (item.type === 'workout') workouts.updateSession(item.sourceId, { recurStatus: next })
  }

  const edit = (item) => {
    if (item.type === 'task') setEditTask(item._raw)
    // Workouts: pause/stop inline here; full edit lives in Workouts tab
  }

  const stop = (item) => {
    if (item.type === 'task')
      tasks.updateTask(item.sourceId, { isRecurring: false, recurDays: [], recurStatus: 'active', recurEndDate: null })
    if (item.type === 'workout')
      workouts.updateSession(item.sourceId, { recurrence: 'none' })
  }

  const activeCount = items.filter(i => i.status === 'active').length

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-up">
      <div>
        <h1 className="text-xl font-serif" style={{ color: 'var(--text)' }}>Repeating Items</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {items.length} total · {activeCount} active
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search recurring items…"
        aria-label="Search recurring items"
        className="input-base"
      />

      {/* Filters */}
      <div className="space-y-2">
        <FilterRow options={TYPE_FILTERS}   value={typeF}   onChange={setTypeF} />
        <FilterRow options={FREQ_FILTERS}   value={freqF}   onChange={setFreqF} />
        <FilterRow options={STATUS_FILTERS} value={statusF} onChange={setStatusF} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          type="tasks"
          title="No repeating items"
          subtitle="Mark a task or workout as repeating to manage it here."
        />
      ) : (
        <Card noPad>
          {filtered.map(item => (
            <RepeatingItemRow
              key={`${item.type}-${item.id}`}
              item={item}
              onTogglePause={togglePause}
              onEdit={edit}
              onStop={stop}
            />
          ))}
        </Card>
      )}

      {editTask && (
        <RecurrencePanel task={editTask} onUpdate={tasks.updateTask} onClose={() => setEditTask(null)} />
      )}
    </div>
  )
}

// Component: FilterRow — horizontal scrollable pill filter
function FilterRow({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
      {options.map(o => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0"
          style={{
            backgroundColor: value === o ? 'var(--accent)' : 'var(--bg-secondary)',
            color:           value === o ? '#fff' : 'var(--text-muted)',
          }}
        >
          {o}
        </button>
      ))}
    </div>
  )
}
