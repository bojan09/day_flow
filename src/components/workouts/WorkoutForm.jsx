// Component: WorkoutForm
// Purpose: Create or edit a workout session — title, type, muscle groups, duration, exercises + sets
import { useState } from 'react'
import { WORKOUT_TYPES, MUSCLE_GROUPS } from '../../hooks/useWorkouts'
import { getTodayKey } from '../../utils/dateUtils'

export default function WorkoutForm({ initial, onSubmit, onCancel }) {
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
        <label className="text-xs font-medium uppercase tracking-wide block mb-1.5"
          style={{ color: 'var(--text-muted)' }}>
          Workout name *
        </label>
        <input
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
          <label className="text-xs font-medium uppercase tracking-wide block mb-1.5"
            style={{ color: 'var(--text-muted)' }}>
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className="input-base w-full"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide block mb-1.5"
            style={{ color: 'var(--text-muted)' }}>
            Duration (min)
          </label>
          <input
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
          {WORKOUT_TYPES.map(t => (
            <button
              key={t} type="button" onClick={() => set('type', t)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
              style={form.type === t
                ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
              }
            >
              {t}
            </button>
          ))}
        </div>
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
                className="text-xs transition-colors"
                style={{ color: 'var(--text-faint)' }}
                onMouseOver={e => e.target.style.color = '#ef4444'}
                onMouseOut={e => e.target.style.color = 'var(--text-faint)'}
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
                  className="text-xs ml-auto" style={{ color: 'var(--text-faint)' }}
                  onMouseOver={e => e.target.style.color = '#ef4444'}
                  onMouseOut={e => e.target.style.color = 'var(--text-faint)'}
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
        <label className="text-xs font-medium uppercase tracking-wide block mb-1.5"
          style={{ color: 'var(--text-muted)' }}>
          Notes (optional)
        </label>
        <textarea
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
          className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
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
