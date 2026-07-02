// Component: TimeBlockView
// Purpose: Hourly daily timeline — drag tasks OR add free-text custom entries.
//          Custom entries (wake up, breakfast, gym etc.) live alongside tasks.
import { useState } from 'react'
import { getTodayKey } from '../../utils/dateUtils'
import { usePersistedState } from '../../hooks/usePersistedState'

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6) // 6am–9pm

function formatHour(h) {
  if (h === 12) return '12 pm'
  return h < 12 ? `${h} am` : `${h - 12} pm`
}

const SLOT_COLORS = ['#3B6B4B','#3B82F6','#F59E0B','#7C3AED','#EF4444','#EC4899','#06B6D4']

export default function TimeBlockView({ tasks }) {
  const storageKey = `timeblocks_${getTodayKey()}`
  const [blocks,    setBlocks]    = usePersistedState(storageKey, {})
  const [custom,    setCustom]    = usePersistedState(`custom_entries_${getTodayKey()}`, {})
  const [dragging,  setDragging]  = useState(null)
  const [addingTo,   setAddingTo]  = useState(null)  // hour slot being manually filled
  const [editingHour, setEditingHour] = useState(null) // hour of custom entry being edited
  const [editText,    setEditText]    = useState('')
  const [entryText, setEntryText] = useState('')
  const [entryColor, setEntryColor] = useState(SLOT_COLORS[0])

  const todayTasks = tasks.getTodayTasks()

  const saveBlocks = (next) => setBlocks(next)

  const assignBlock = (hour, taskId) => {
    const next = { ...blocks }
    Object.keys(next).forEach(h => { if (next[h] === taskId) delete next[h] })
    if (taskId) next[hour] = taskId
    saveBlocks(next)
  }

  const clearSlot = (hour) => {
    const next = { ...blocks }
    delete next[hour]
    saveBlocks(next)
  }

  const addCustomEntry = (hour) => {
    if (!entryText.trim()) return
    setCustom(prev => ({
      ...prev,
      [hour]: { text: entryText.trim(), color: entryColor },
    }))
    setEntryText('')
    setAddingTo(null)
  }

  const editCustomEntry = (hour) => {
    setEditingHour(hour)
    setEditText(custom[hour]?.text || '')
  }

  const saveEditedEntry = (hour) => {
    if (!editText.trim()) { removeCustomEntry(hour); setEditingHour(null); return }
    setCustom(prev => ({ ...prev, [hour]: { ...prev[hour], text: editText.trim() } }))
    setEditingHour(null)
    setEditText('')
  }

  const removeCustomEntry = (hour) => {
    setCustom(prev => {
      const next = { ...prev }
      delete next[hour]
      return next
    })
  }

  const unscheduled = todayTasks.filter(
    t => !Object.values(blocks).includes(t.id)
  )

  return (
    <div className="max-w-2xl mx-auto pt-2 space-y-4">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Drag tasks onto slots · or tap a slot to add a custom entry
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Unscheduled tasks pool */}
        <div
          className="rounded-2xl border p-4 md:col-span-1"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>
            Unscheduled ({unscheduled.length})
          </p>
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {unscheduled.length === 0 ? (
              <p className="text-xs italic" style={{ color: 'var(--text-faint)' }}>All tasks scheduled ✓</p>
            ) : unscheduled.map(t => {
              const PRIORITY_COLOR = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' }
              return (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => setDragging(t.id)}
                  onDragEnd={() => setDragging(null)}
                  className="px-3 py-2 rounded-xl border text-xs cursor-grab active:cursor-grabbing transition-all"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor:     'var(--border)',
                    color:           'var(--text)',
                    opacity:         dragging === t.id ? 0.5 : 1,
                    borderLeft:      `3px solid ${PRIORITY_COLOR[t.priority] || '#ccc'}`,
                  }}
                >
                  <span className="truncate block font-medium">{t.title}</span>
                  {t.estimateMins && (
                    <span style={{ color: 'var(--text-faint)' }}>~{t.estimateMins}min</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Timeline */}
        <div
          className="rounded-2xl border overflow-hidden md:col-span-2"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>
              Today's Timeline
            </p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '520px' }}>
            {HOURS.map(hour => {
              const taskId     = blocks[hour]
              const task       = taskId ? todayTasks.find(t => t.id === taskId) : null
              const customEntry = custom[hour]
              const hasContent = !!task || !!customEntry
              const isAdding   = addingTo === hour

              return (
                <div
                  key={hour}
                  className="flex border-b min-h-[52px]"
                  style={{ borderColor: 'var(--border-soft)' }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => { if (dragging) { assignBlock(hour, dragging); setDragging(null) } }}
                >
                  {/* Hour label */}
                  <div
                    className="w-14 flex-shrink-0 flex items-center justify-center text-[11px] font-medium border-r"
                    style={{ color: 'var(--text-faint)', borderColor: 'var(--border-soft)' }}
                  >
                    {formatHour(hour)}
                  </div>

                  {/* Slot content */}
                  <div className="flex-1 px-3 py-2 flex items-center gap-2 min-w-0">
                    {task && (
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <span className="text-xs font-medium truncate flex-1" style={{ color: 'var(--text)' }}>
                          {task.title}
                        </span>
                        <button
                          onClick={() => clearSlot(hour)}
                          className="hover-danger text-[10px] w-5 h-5 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                          style={{ color: 'var(--text-faint)' }}
                        >✕</button>
                      </div>
                    )}

                    {customEntry && !task && editingHour !== hour && (
                      <div className="flex-1 flex items-center gap-2 min-w-0 group/entry">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: customEntry.color }} />
                        <span
                          className="text-xs flex-1 truncate cursor-pointer"
                          style={{ color: 'var(--text)' }}
                          onDoubleClick={() => editCustomEntry(hour)}
                          title="Double-click to edit"
                        >
                          {customEntry.text}
                        </span>
                        <button
                          onClick={() => editCustomEntry(hour)}
                          className="opacity-0 group-hover/entry:opacity-100 text-[10px] transition-opacity"
                          style={{ color: 'var(--accent)' }}
                        >✏️</button>
                        <button
                          onClick={() => removeCustomEntry(hour)}
                          className="hover-danger text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ color: 'var(--text-faint)' }}
                        >✕</button>
                      </div>
                    )}
                    {customEntry && !task && editingHour === hour && (
                      <div className="flex-1 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: customEntry.color }} />
                        <input
                          autoFocus
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          className="flex-1 text-xs bg-transparent outline-none border-b"
                          style={{ borderColor: 'var(--accent-mid)', color: 'var(--text)' }}
                          onKeyDown={e => {
                            if (e.key === 'Enter')  saveEditedEntry(hour)
                            if (e.key === 'Escape') { setEditingHour(null); setEditText('') }
                          }}
                          onBlur={() => saveEditedEntry(hour)}
                        />
                        <button onClick={() => saveEditedEntry(hour)} className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>Save</button>
                      </div>
                    )}

                    {isAdding && (
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex gap-1">
                          {SLOT_COLORS.map(c => (
                            <button
                              key={c} type="button"
                              onClick={() => setEntryColor(c)}
                              className="w-4 h-4 rounded-full transition-transform"
                              style={{ backgroundColor: c, transform: entryColor === c ? 'scale(1.3)' : 'scale(1)' }}
                            />
                          ))}
                        </div>
                        <input
                          autoFocus
                          value={entryText}
                          onChange={e => setEntryText(e.target.value)}
                          placeholder="e.g. Breakfast"
                          className="flex-1 text-xs bg-transparent outline-none border-b"
                          style={{ borderColor: 'var(--accent-mid)', color: 'var(--text)' }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') addCustomEntry(hour)
                            if (e.key === 'Escape') { setAddingTo(null); setEntryText('') }
                          }}
                        />
                        <button onClick={() => addCustomEntry(hour)} className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>Add</button>
                        <button aria-label="Cancel" onClick={() => { setAddingTo(null); setEntryText('') }} className="tap-target text-[10px]" style={{ color: 'var(--text-faint)' }}>✕</button>
                      </div>
                    )}

                    {!hasContent && !isAdding && (
                      <button
                        onClick={() => { setAddingTo(hour); setEntryText('') }}
                        className="hover-text-accent text-[10px] transition-colors w-full text-left"
                        style={{ color: 'var(--text-faint)' }}
                      >
                        + add entry
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
