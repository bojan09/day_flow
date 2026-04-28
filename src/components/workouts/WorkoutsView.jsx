// Component: WorkoutsView
// Purpose: Full workouts tab — stats, session list, add/edit modal, personal bests
import { useState } from 'react'
import WorkoutStatsBar from './WorkoutStatsBar'
import WorkoutCard     from './WorkoutCard'
import WorkoutForm     from './WorkoutForm'
import Modal           from '../ui/Modal'
import EmptyState      from '../ui/EmptyState'

// Mini weekly frequency bar chart
function WeeklyBar({ workouts }) {
  const data    = workouts.getWeeklyVolume()
  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>
        This week
      </p>
      <div className="flex items-end justify-between gap-1.5 h-14">
        {data.map(d => (
          <div key={d.dateKey} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm transition-all duration-500 min-h-[3px]"
              style={{
                height:          `${Math.max((d.count / maxCount) * 48, d.count > 0 ? 8 : 3)}px`,
                backgroundColor: d.count > 0 ? 'var(--accent)' : 'var(--border)',
              }}
            />
            <span className="text-[9px] font-medium" style={{ color: 'var(--text-faint)' }}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Personal bests list
function PersonalBestsList({ workouts }) {
  const pbs = workouts.getPersonalBests().slice(0, 5)
  if (pbs.length === 0) return null

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>
        🏆 Personal bests
      </p>
      <div className="space-y-2.5">
        {pbs.map(pb => (
          <div key={pb.name} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text)' }}>{pb.name}</span>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--accent)' }}
              >
                {pb.weight}{pb.unit}
              </span>
              {pb.reps && (
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  ×{pb.reps}
                </span>
              )}
              <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                {pb.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WorkoutsView({ workouts }) {
  const [modal,    setModal]    = useState(false)   // 'add' | 'edit'
  const [editing,  setEditing]  = useState(null)    // session being edited
  const [filter,   setFilter]   = useState('today') // 'all' | 'today' | 'done'

  const openAdd  = ()          => { setEditing(null);    setModal('add')  }
  const openEdit = (session)   => { setEditing(session); setModal('edit') }
  const close    = ()          => { setModal(false);     setEditing(null) }

  const handleSubmit = (data) => {
    if (modal === 'edit' && editing) {
      workouts.updateSession(editing.id, data)
    } else {
      workouts.addSession(data)
    }
    close()
  }

  const visible = workouts.sessions.filter(s => {
    if (filter === 'today') return s.date === new Date().toISOString().split('T')[0]
    if (filter === 'done')  return s.completed
    return true
  })

  const FILTER_TABS = [
    { id: 'all',   label: 'All'     },
    { id: 'today', label: 'Today'   },
    { id: 'done',  label: 'Done'    },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">

      {/* Stats */}
      <WorkoutStatsBar workouts={workouts} />

      {/* Weekly bar */}
      <WeeklyBar workouts={workouts} />

      {/* Personal bests */}
      <PersonalBestsList workouts={workouts} />

      {/* Header + filter */}
      <div className="flex items-center justify-between gap-3">
        <div
          className="flex gap-0.5 rounded-xl p-0.5"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          {FILTER_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={filter === t.id
                ? { backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)', color: 'var(--text)' }
                : { color: 'var(--text-faint)' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-full text-white text-sm font-medium transition-all hover:-translate-y-0.5 active:scale-95"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          + Log Workout
        </button>
      </div>

      {/* Session list */}
      {visible.length === 0 ? (
        <EmptyState
          type="default"
          title={filter === 'today' ? 'No workouts today' : 'No workouts yet'}
          subtitle={filter === 'today'
            ? 'Ready to move? Log your first session.'
            : 'Start logging workouts to track your progress and hit personal bests.'}
          action="+ Log Workout"
          onAction={openAdd}
        />
      ) : (
        <div className="space-y-3">
          {visible.map(session => (
            <WorkoutCard
              key={session.id}
              session={session}
              workouts={workouts}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal
        isOpen={!!modal}
        onClose={close}
        title={modal === 'edit' ? 'Edit workout' : 'Log workout'}
      >
        <WorkoutForm
          initial={modal === 'edit' ? editing : null}
          onSubmit={handleSubmit}
          onCancel={close}
        />
      </Modal>
    </div>
  )
}
