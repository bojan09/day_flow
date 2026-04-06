// Component: EndOfDayReview
// Purpose: Appears after 6pm — "Did you hit your focus task?" + tomorrow intention
import { useState } from 'react'
import { storage } from '../../services/storage'
import { getTodayKey } from '../../utils/dateUtils'
import Card from '../ui/Card'

const KEY = 'eod_reviews'

export default function EndOfDayReview({ tasks }) {
  const hour      = new Date().getHours()
  const todayKey  = getTodayKey()
  const reviews   = storage.get(KEY, {})
  const alreadyDone = !!reviews[todayKey]

  const [step,       setStep]       = useState(0)
  const [focusHit,   setFocusHit]   = useState(null)
  const [tomorrow,   setTomorrow]   = useState('')
  const [dismissed,  setDismissed]  = useState(alreadyDone)

  if (hour < 18 || dismissed) return null

  const focusTask = tasks.getFocusTask()

  const handleSave = () => {
    const updated = { ...reviews, [todayKey]: { focusHit, tomorrow, savedAt: new Date().toISOString() } }
    storage.set(KEY, updated)
    setDismissed(true)
  }

  return (
    <Card className="border-violet-100 bg-violet-50">
      <p className="text-xs font-medium uppercase tracking-wider text-violet-600 mb-3">🌙 End of Day Review</p>

      {step === 0 && (
        <div>
          <p className="text-sm text-ink font-serif mb-3">
            {focusTask
              ? `Did you complete "${focusTask.title}"?`
              : 'How did today go overall?'}
          </p>
          <div className="flex gap-2">
            {['Yes! ✅', 'Partially 🤏', 'Not today 😞'].map(ans => (
              <button key={ans} onClick={() => { setFocusHit(ans); setStep(1) }}
                className="flex-1 py-2 rounded-xl text-xs font-medium border border-violet-200 bg-white hover:bg-violet-50 text-ink transition-all">
                {ans}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-ink font-serif">What will you do differently tomorrow?</p>
          <textarea
            value={tomorrow}
            onChange={e => setTomorrow(e.target.value)}
            placeholder="One small thing to improve..."
            rows={2}
            className="w-full text-sm bg-white border border-violet-200 rounded-xl px-3 py-2 outline-none resize-none focus:ring-2 focus:ring-violet-300 text-ink placeholder-violet-300/60"
          />
          <div className="flex gap-2">
            <button onClick={handleSave}
              className="flex-1 py-2 rounded-xl bg-violet-500 text-white text-xs font-medium hover:bg-violet-700 transition-colors">
              Save Review
            </button>
            <button onClick={() => setDismissed(true)}
              className="px-3 py-2 rounded-xl border border-violet-200 text-xs text-violet-400 hover:bg-violet-100 transition-colors">
              Skip
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
