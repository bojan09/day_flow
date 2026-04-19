// Component: RoutinesView
// Purpose: Full routines tab — create, edit, delete routines and run daily checklists.
//          Sorted by time of day. Modal editor for create/edit.
import { useState } from 'react'
import RoutineCard   from './RoutineCard'
import RoutineEditor from './RoutineEditor'
import Modal         from '../ui/Modal'
import EmptyState    from '../ui/EmptyState'

// Sort routines by natural time-of-day order
const TIME_ORDER = { morning: 0, midday: 1, evening: 2, anytime: 3 }

function sortByTime(routines) {
  return [...routines].sort(
    (a, b) => (TIME_ORDER[a.time] ?? 3) - (TIME_ORDER[b.time] ?? 3)
  )
}

export default function RoutinesView({ routines }) {
  const [modal,   setModal]   = useState(false)   // 'add' | 'edit'
  const [editing, setEditing] = useState(null)     // routine being edited

  const openAdd  = ()         => { setEditing(null);    setModal('add')  }
  const openEdit = (routine)  => { setEditing(routine); setModal('edit') }
  const close    = ()         => { setModal(false);     setEditing(null) }

  const handleSubmit = (data) => {
    if (modal === 'edit' && editing) {
      routines.updateRoutine(editing.id, data)
    } else {
      routines.addRoutine(data)
    }
    close()
  }

  const handleDelete = (id) => routines.deleteRoutine(id)

  const sorted = sortByTime(routines.routines)

  // Contextual greeting based on time of day
  const hour    = new Date().getHours()
  const greeting =
    hour <  12 ? 'Good morning — start your day with intention.' :
    hour <  17 ? 'Good afternoon — stay on track.' :
                 'Good evening — wind down with purpose.'

  return (
    <div className="max-w-lg mx-auto space-y-4 pt-2">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {greeting}
        </p>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-full text-white text-sm font-medium transition-all hover:-translate-y-0.5 active:scale-95"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          + New Routine
        </button>
      </div>

      {/* Summary chips */}
      {routines.routines.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {sorted.map(r => {
            const pct = routines.getCompletion(r.id)
            return (
              <div
                key={r.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium"
                style={{
                  backgroundColor: pct === 100 ? 'var(--accent-light)' : 'var(--surface)',
                  borderColor:     pct === 100 ? 'var(--accent-mid)'   : 'var(--border)',
                  color:           pct === 100 ? 'var(--accent)'       : 'var(--text-muted)',
                }}
              >
                <span>{r.emoji}</span>
                <span>{r.name}</span>
                {pct === 100 && <span>✓</span>}
                {pct > 0 && pct < 100 && (
                  <span style={{ color: 'var(--accent)' }}>{pct}%</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Routine cards */}
      {sorted.length === 0 ? (
        <EmptyState
          type="default"
          title="No routines yet"
          subtitle="Routines build powerful habits. Create your morning or evening checklist to get started."
          action="+ New Routine"
          onAction={openAdd}
        />
      ) : (
        <div className="space-y-4">
          {sorted.map(r => (
            <RoutineCard
              key={r.id}
              routine={r}
              routines={routines}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        isOpen={!!modal}
        onClose={close}
        title={modal === 'edit' ? `Edit: ${editing?.name}` : 'New Routine'}
      >
        <RoutineEditor
          initial={modal === 'edit' ? editing : null}
          onSubmit={handleSubmit}
          onCancel={close}
        />
      </Modal>
    </div>
  )
}
