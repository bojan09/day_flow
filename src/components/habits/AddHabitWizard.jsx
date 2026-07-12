// Component: AddHabitWizard
// Purpose: Two-step habit creation — Step 1 basics, Step 2 optional advanced
//          rules/reminders/pairing. Step content is passed in by the parent
//          (AddHabitModal.jsx) which still owns all form state — this
//          component only handles step navigation + the progress dots.
import { useState } from 'react'

export default function AddHabitWizard({ basicsStep, advancedStep, onSubmit, canAdvance }) {
  const [step, setStep] = useState(1)
  return (
    <div className="space-y-5">
      <div className="flex gap-1.5 justify-center">
        {[1, 2].map(n => (
          <div key={n} className="h-1.5 rounded-full transition-all"
            style={{ width: step === n ? 24 : 8, backgroundColor: step >= n ? 'var(--accent)' : 'var(--border)' }} />
        ))}
      </div>
      {step === 1 ? basicsStep : advancedStep}
      <div className="flex justify-between pt-2">
        {step === 2 ? (
          <button type="button" onClick={() => setStep(1)} className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>← Back</button>
        ) : <span />}
        {step === 1 ? (
          <button type="button" disabled={!canAdvance} onClick={() => setStep(2)}
            className="px-4 py-2 rounded-full text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent)' }}>Next →</button>
        ) : (
          <button type="button" onClick={onSubmit}
            className="px-4 py-2 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--accent)' }}>Save habit</button>
        )}
      </div>
    </div>
  )
}
