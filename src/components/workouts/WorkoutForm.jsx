// Component: WorkoutForm
// Purpose: Create or edit a workout session — title, type, muscle groups, duration, exercises + sets
import { useState } from 'react'
import { MUSCLE_GROUPS } from '../../hooks/useWorkouts'
import { useCustomWorkoutTypes } from '../../hooks/useCustomWorkoutTypes'
import { getTodayKey } from '../../utils/dateUtils'
import WorkoutTemplatePicker from './WorkoutTemplatePicker'

export default function WorkoutForm({ initial, sessions = [], onSubmit, onCancel }) {
  const isEditing = !!initial
  // Only show the "start from template" picker when creating a brand new session.
  const [started, setStarted] = useState(isEditing)

  const workoutTypes = useCustomWorkoutTypes()
  const [addingType,   setAddingType]   = useState(false)
  const [newTypeName,  setNewTypeName]  = useState('')
  const [typeError,    setTypeError]    = useState('')

  const [form, setForm] = useState({
    title:        initial?.title        || '',
    type:         initial?.type         || 'Strength',
    muscleGroups: initial?.muscleGroups || [],
    durationMins: initial?.durationMins || '',
    date:         initial?.date         || getTodayKey(),
    notes:        initial?.notes        || '',
    exercises:    initial?.exercises    || [],
    recurrence:   initial?.recurrence   || 'none',
  })
  const [newExName, setNewExName] = useState('')

  // Last 5 distinct-by-type sessions, newest first — used as quick-start templates.
  const recentSessions = (() => {
    const seenTypes = new Set()
    const sorted = [...sessions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const result = []
    for (const s of sorted) {
      if (seenTypes.has(s.type)) continue
      seenTypes.add(s.type)
      result.push(s)
      if (result.length >= 5) break
    }
    return result
  })()

  const handlePickTemplate = (session) => {
    setForm(p => ({
      ...p,
      title:        session.title        || p.title,
      type:         session.type         || p.type,
      muscleGroups: session.muscleGroups || p.muscleGroups,
      exercises:    (session.exercises || []).map(ex => ({
        ...ex,
        id:   Date.now().toString() + Math.random().toString(36).slice(2, 6),
        sets: (ex.sets || []).map(s => ({ ...s, id: Date.now().toString() + Math.random().toString(36).slice(2, 6), done: false })),
      })),
    }))
    setStarted(true)
  }

  if (!isEditing && !started) {
    return (
      <WorkoutTemplatePicker
        recentSessions={recentSessions}
        onPick={handlePickTemplate}
        onBlank={() => setStarted(true)}
      />
    )
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const toggleMuscle = (mg) =>
    set('muscleGroups',
      form.muscleGroups.includes(mg)
        ? form.muscleGroups.filter(m => m !== mg)
        : [...form.muscleGroups, mg]
    )

  const addExercise = () => {
    if (!newExName.trim()) return
    set('exercises', [
      ...form.exercises,
      { id: Date.now().toString(), name: newExName.trim(), sets: [] },
    ])
    setNewExName('')
  }

  const removeExercise = (id) =>
    set('exercises', form.exercises.filter(e => e.id !== id))

  const addSet = (exId) =>
    set('exercises', form.exercises.map(e =>
      e.id !== exId ? e : {
        ...e,
        sets: [...e.sets, { id: Date.now().toString(), reps: '', weight: '', unit: 'kg', done: false }],
      }
    ))

  const updateSet = (exId, setId, field, value) =>
    set('exercises', form.exercises.map(e =>
      e.id !== exId ? e : {
        ...e,
        sets: e.sets.map(s => s.id === setId ? { ...s, [field]: value } : s),
      }
    ))

  const removeSet = (exId, setId) =>
    set('exercises', form.exercises.map(e =>
      e.id !== exId ? e : { ...e, sets: e.sets.filter(s => s.id !== setId) }
    ))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit({ ...form, durationMins: form.durationMins ? Number(form.durationMins) : null })
  }

  const inputStyle = {
    backgroundColor: 'var(--bg)',
    borderColor:     'var(--border)',
    color:           'var(--text)',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Title */}
      <div>
        <label htmlFor="workout-title" className="text-xs font-medium uppercase tracking-wide block mb-1.5"
          style={{ color: 'var(--text-muted)' }}>
          Workout name *
        </label>
        <input
          id="workout-title"
          autoFocus
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="e.g. Push Day, Morning Run"
          className="input-base w-full"
          style={inputStyle}
        />
      </div>

      {/* Date + Duration */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="workout-date" className="text-xs font-medium uppercase tracking-wide block mb-1.5"
            style={{ color: 'var(--text-muted)' }}>
            Date
          </label>
          <input
            id="workout-date"
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className="input-base w-full"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="workout-duration" className="text-xs font-medium uppercase tracking-wide block mb-1.5"
            style={{ color: 'var(--text-muted)' }}>
            Duration (min)
          </label>
          <input
            id="workout-duration"
            type="number"
            min="1" max="300"
            value={form.durationMins}
            onChange={e => set('durationMins', e.target.value)}
            placeholder="45"
            className="input-base w-full"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="text-xs font-medium uppercase tracking-wide block mb-2"
          style={{ color: 'var(--text-muted)' }}>
          Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {workoutTypes.all.map(t => (
            <div key={t} className="relative group/type">
              <button
                type="button" onClick={() => set('type', t)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                style={form.type === t
                  ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                  : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                }
              >
                {t}
              </button>
              {workoutTypes.isCustom(t) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (form.type === t) set('type', 'Strength')
                    workoutTypes.removeType(t)
                  }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] items-center justify-center opacity-0 group-hover/type:opacity-100 transition-opacity hidden group-hover/type:flex"
                  title="Remove type"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {!addingType && (
            <button
              type="button"
              onClick={() => setAddingType(true)}
              className="hover-accent-soft px-3 py-1.5 rounded-full text-xs font-medium transition-all border border-dashed"
              style={{ borderColor: 'var(--accent-mid)', color: 'var(--accent)' }}
            >
              + Custom
            </button>
          )}
        </div>

        {addingType && (
          <div className="flex items-center gap-2 mt-2">
            <input
              autoFocus
              value={newTypeName}
              onChange={e => { setNewTypeName(e.target.value); setTypeError('') }}
              placeholder="Type name…"
              maxLength={24}
              className="input-base flex-1 text-sm py-1.5"
              style={{ backgroundColor: 'var(--bg)', borderColor: typeError ? '#f87171' : 'var(--border)', color: 'var(--text)' }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const trimmed = newTypeName.trim()
                  if (!trimmed) return
                  const ok = workoutTypes.addType(trimmed)
                  if (ok === false) { setTypeError('That type already exists'); return }
                  set('type', trimmed)
                  setNewTypeName(''); setAddingType(false); setTypeError('')
                }
                if (e.key === 'Escape') { setAddingType(false); setNewTypeName(''); setTypeError('') }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const trimmed = newTypeName.trim()
                if (!trimmed) return
                const ok = workoutTypes.addType(trimmed)
                if (ok === false) { setTypeError('That type already exists'); return }
                set('type', trimmed)
                setNewTypeName(''); setAddingType(false); setTypeError('')
              }}
              disabled={!newTypeName.trim()}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-white disabled:opacity-40 flex-shrink-0"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setAddingType(false); setNewTypeName(''); setTypeError('') }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0"
              style={{ color: 'var(--text-faint)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
          </div>
        )}
        {typeError && (
          <p className="text-xs text-red-500 mt-1">{typeError}</p>
        )}
      </div>

      {/* Muscle groups */}
      <div>
        <label className="text-xs font-medium uppercase tracking-wide block mb-2"
          style={{ color: 'var(--text-muted)' }}>
          Muscle groups
        </label>
        <div className="flex flex-wrap gap-1.5">
          {MUSCLE_GROUPS.map(mg => (
            <button
              key={mg} type="button" onClick={() => toggleMuscle(mg)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
              style={form.muscleGroups.includes(mg)
                ? { backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent)', color: 'var(--accent)' }
                : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
              }
            >
              {mg}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises */}
      <div>
        <label className="text-xs font-medium uppercase tracking-wide block mb-2"
          style={{ color: 'var(--text-muted)' }}>
          Exercises
        </label>

        {form.exercises.map(ex => (
          <div
            key={ex.id}
            className="rounded-xl border p-3 mb-2"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            {/* Exercise header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {ex.name}
              </span>
              <button
                type="button" onClick={() => removeExercise(ex.id)}
                className="hover-danger text-xs transition-colors"
                style={{ color: 'var(--text-faint)' }}
              >
                Remove
              </button>
            </div>

            {/* Sets */}
            {ex.sets.map((s, si) => (
              <div key={s.id} className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] w-8 flex-shrink-0" style={{ color: 'var(--text-faint)' }}>
                  S{si + 1}
                </span>
                <input
                  type="number" placeholder="Reps" value={s.reps}
                  onChange={e => updateSet(ex.id, s.id, 'reps', e.target.value)}
                  className="w-16 text-xs px-2 py-1 rounded-lg border outline-none"
                  style={inputStyle}
                />
                <input
                  type="number" placeholder="Weight" value={s.weight}
                  onChange={e => updateSet(ex.id, s.id, 'weight', e.target.value)}
                  className="w-20 text-xs px-2 py-1 rounded-lg border outline-none"
                  style={inputStyle}
                />
                <select
                  value={s.unit}
                  onChange={e => updateSet(ex.id, s.id, 'unit', e.target.value)}
                  className="text-xs px-2 py-1 rounded-lg border outline-none"
                  style={inputStyle}
                >
                  {['kg', 'lbs', 'min', 'm'].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <button
                  type="button" onClick={() => removeSet(ex.id, s.id)}
                  aria-label="Remove set"
                  className="hover-danger text-xs ml-auto" style={{ color: 'var(--text-faint)' }}
                >✕</button>
              </div>
            ))}

            <button
              type="button" onClick={() => addSet(ex.id)}
              className="text-xs font-medium mt-1"
              style={{ color: 'var(--accent)' }}
            >
              + Add set
            </button>
          </div>
        ))}

        {/* Add exercise */}
        <div className="flex gap-2 mt-1">
          <input
            value={newExName}
            onChange={e => setNewExName(e.target.value)}
            placeholder="Exercise name (e.g. Bench Press)"
            className="input-base flex-1 text-sm"
            style={inputStyle}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addExercise() }}}
          />
          <button
            type="button" onClick={addExercise}
            disabled={!newExName.trim()}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40 transition-all"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Recurrence */}
      <div>
        <label className="text-xs font-medium uppercase tracking-wide block mb-2"
          style={{ color: 'var(--text-muted)' }}>
          Repeat
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'none',    label: 'Once'    },
            { id: 'daily',   label: 'Daily'   },
            { id: 'weekly',  label: 'Weekly'  },
            { id: 'monthly', label: 'Monthly' },
          ].map(opt => (
            <button key={opt.id} type="button" onClick={() => set('recurrence', opt.id)}
              className="py-2 rounded-xl text-xs font-medium transition-all border"
              style={form.recurrence === opt.id
                ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
              }>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="workout-notes" className="text-xs font-medium uppercase tracking-wide block mb-1.5"
          style={{ color: 'var(--text-muted)' }}>
          Notes (optional)
        </label>
        <textarea
          id="workout-notes"
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="How did it feel? Any PRs?"
          rows={2}
          className="input-base w-full resize-none"
          style={inputStyle}
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-1">
        <button
          type="button" onClick={onCancel}
          className="hover-surface flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!form.title.trim()}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {initial ? 'Save changes' : 'Log workout'}
        </button>
      </div>
    </form>
  )
}
