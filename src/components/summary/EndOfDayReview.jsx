// Component: EndOfDayReview
// Purpose: Evening check-in (after 6pm) — focus task hit?, tomorrow intention.
//          CSS variables throughout, no Card dependency.
import { useState } from 'react'
import { usePersistedState } from '../../hooks/usePersistedState'
import { getTodayKey } from '../../utils/dateUtils'

export default function EndOfDayReview({ tasks }) {
  const hour     = new Date().getHours()
  const todayKey = getTodayKey()

  const [reviews, setReviews] = usePersistedState('eod_reviews', {})
  const alreadyDone = !!reviews[todayKey]

  const [step,      setStep]      = useState(0)
  const [focusHit,  setFocusHit]  = useState(null)
  const [tomorrow,  setTomorrow]  = useState('')
  const [dismissed, setDismissed] = useState(alreadyDone)

  if (hour < 18 || dismissed) return null

  const focusTask = tasks.getFocusTask()

  const handleSave = () => {
    setReviews(prev => ({
      ...prev,
      [todayKey]: { focusHit, tomorrow, savedAt: new Date().toISOString() },
    }))
    setDismissed(true)
  }

  const inputStyle = {
    backgroundColor: 'var(--bg)',
    borderColor:     'var(--border)',
    color:           'var(--text)',
  }

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor:     'var(--border)',
        boxShadow:       'var(--shadow-card)',
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'var(--accent-text)' }}
      >
        🌙 End of Day Review
      </p>

      {step === 0 && (
        <div>
          <p className="font-serif text-base mb-4" style={{ color: 'var(--text)' }}>
            {focusTask
              ? `Did you complete "${focusTask.title}"?`
              : 'How did today go overall?'}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Yes! ✅',        value: 'yes'      },
              { label: 'Partially 🤏',   value: 'partial'  },
              { label: 'Not today 😞',   value: 'no'       },
            ].map(ans => (
              <button
                key={ans.value}
                onClick={() => { setFocusHit(ans.value); setStep(1) }}
                className="hover-accent-soft py-3 rounded-2xl text-sm font-medium border transition-all active:scale-95"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                {ans.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="font-serif text-base" style={{ color: 'var(--text)' }}>
            What will you do differently tomorrow?
          </p>
          <textarea
            value={tomorrow}
            onChange={e => setTomorrow(e.target.value)}
            placeholder="One small thing to improve…"
            rows={2}
            className="w-full text-sm rounded-xl px-4 py-3 outline-none resize-none border"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent-mid)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Save Review
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-4 py-2.5 rounded-xl border text-sm transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
