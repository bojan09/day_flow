// Component: MorningReview
// Purpose: "Begin your day" — the morning half of the Daily Reflection ritual.
//          Flow follows the spec: OPEN → INTENTION → PRIORITY → CONTROL → BEGIN.
//          Deliberately one question per screen, generous spacing, no cards
//          stacked on cards: the spec asks for calm and spacious, not a form.
import { useState } from 'react'
import { Sun, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { getTodayKey } from '../../utils/dateUtils'
import { selectReference } from '../../services/stoicThemeSelection'

const INTENTIONS = ['Focused', 'Calm', 'Disciplined', 'Patient', 'Present', 'Courageous', 'Deliberate', 'Grateful']
const OBSTACLES  = ['Distractions', 'Procrastination', 'Too many tasks', 'Low energy', 'Unexpected interruptions', 'Stress']

// Chip row used for the pick-one answers. Always allows a written answer too —
// the spec says the user should always be able to write their own.
function ChipGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(active ? '' : opt)}
            className="px-4 py-2 rounded-full text-sm font-medium border transition-all active:scale-95"
            style={active
              ? { backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }
              : { backgroundColor: 'var(--surface)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
            aria-pressed={active}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function Step({ title, hint, children }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-1.5">
        <h2 className="font-serif text-2xl leading-snug" style={{ color: 'var(--text)' }}>{title}</h2>
        {hint && <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
      </div>
      {children}
    </div>
  )
}

const textAreaStyle = {
  backgroundColor: 'var(--bg)',
  borderColor:     'var(--border)',
  color:           'var(--text)',
}

export default function MorningReview({ reflections, tasks, onClose, dateKey = getTodayKey() }) {
  const { entry, carryForward, save, completeMorning } = reflections

  const todayTasks   = tasks?.getTodayTasks?.() ?? []
  const overdueCount = tasks?.tasks?.filter(t => tasks.isOverdue?.(t)).length ?? 0

  // Context-driven rather than random, per the spec.
  const reference = selectReference(dateKey, {
    overdueCount,
    todayTaskCount: todayTasks.length,
    yesterdayLivedIntention: reflections.yesterday?.livedIntention ?? null,
    hasCarryForward: !!carryForward,
  })

  const [step, setStep]   = useState(0)
  const [showRef, setRef] = useState(false)
  const [draft, setDraft] = useState({
    intention:      entry.intention || '',
    priorityText:   entry.priorityText || '',
    priorityTaskId: entry.priorityTaskId || null,
    inControl:      entry.inControl || '',
    obstacle:       entry.obstacle || '',
  })

  const set = (patch) => setDraft(d => ({ ...d, ...patch }))

  const steps = [
    // ── OPEN ────────────────────────────────────────────────────────────────
    {
      key: 'open',
      render: () => (
        <Step title="Begin your day">
          {carryForward && (
            <div
              className="rounded-2xl border p-4 space-y-1"
              style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--accent-text)' }}>
                From yesterday
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--accent-text)' }}>{carryForward}</p>
            </div>
          )}

          <figure
            className="rounded-2xl border p-5 space-y-3"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <blockquote
              className="font-serif text-xl leading-relaxed"
              style={{ color: 'var(--text)' }}
            >
              “{reference.quote}”
            </blockquote>
            <figcaption className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {reference.author} — {reference.work}
              {reference.section ? `, ${reference.section}` : ''}
            </figcaption>

            {reference.reason && (
              <p className="text-xs italic" style={{ color: 'var(--text-faint)' }}>
                Shown because: {reference.reason.toLowerCase()}.
              </p>
            )}

            <button
              type="button"
              onClick={() => setRef(v => !v)}
              className="text-xs font-medium underline underline-offset-2"
              style={{ color: 'var(--accent-text)' }}
              aria-expanded={showRef}
            >
              {showRef ? 'Hide reference' : 'Read reference'}
            </button>

            {showRef && (
              <div className="space-y-2 pt-1">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {reference.meaning}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                  Translation: {reference.translation}
                </p>
              </div>
            )}
          </figure>
        </Step>
      ),
    },

    // ── INTENTION ───────────────────────────────────────────────────────────
    {
      key: 'intention',
      render: () => (
        <Step title="How do you want to approach today?" hint="Pick one, or write your own.">
          <ChipGroup options={INTENTIONS} value={draft.intention} onChange={v => set({ intention: v })} />
          <input
            value={INTENTIONS.includes(draft.intention) ? '' : draft.intention}
            onChange={e => set({ intention: e.target.value })}
            placeholder="Or in your own words…"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={textAreaStyle}
          />
        </Step>
      ),
    },

    // ── PRIORITY ────────────────────────────────────────────────────────────
    {
      key: 'priority',
      render: () => (
        <Step
          title="What matters most today?"
          hint="One thing. Pick a task you already have, or name it yourself."
        >
          {todayTasks.length > 0 && (
            <div className="space-y-1.5 max-h-52 overflow-y-auto scrollbar-hide">
              {todayTasks.map(t => {
                const active = draft.priorityTaskId === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set(active
                      ? { priorityTaskId: null, priorityText: '' }
                      : { priorityTaskId: t.id, priorityText: t.title })}
                    className="w-full text-left px-4 py-3 rounded-xl border text-sm transition-all active:scale-[0.99]"
                    style={active
                      ? { backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }
                      : { backgroundColor: 'var(--surface)', color: 'var(--text)', borderColor: 'var(--border)' }}
                    aria-pressed={active}
                  >
                    {t.title}
                  </button>
                )
              })}
            </div>
          )}
          <input
            value={draft.priorityTaskId ? '' : draft.priorityText}
            onChange={e => set({ priorityText: e.target.value, priorityTaskId: null })}
            placeholder={todayTasks.length ? 'Or something not on the list…' : 'What matters most today?'}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={textAreaStyle}
          />
        </Step>
      ),
    },

    // ── CONTROL ─────────────────────────────────────────────────────────────
    {
      key: 'control',
      render: () => (
        <Step
          title="What is within your control today?"
          hint="Not the outcome — the part that is actually yours."
        >
          <textarea
            value={draft.inControl}
            onChange={e => set({ inControl: e.target.value })}
            rows={3}
            placeholder="I can control…"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none leading-relaxed"
            style={textAreaStyle}
          />
        </Step>
      ),
    },

    // ── OBSTACLE (optional) ─────────────────────────────────────────────────
    {
      key: 'obstacle',
      render: () => (
        <Step title="What could get in your way?" hint="Optional — naming it early takes some of its power.">
          <ChipGroup options={OBSTACLES} value={draft.obstacle} onChange={v => set({ obstacle: v })} />
          <input
            value={OBSTACLES.includes(draft.obstacle) ? '' : draft.obstacle}
            onChange={e => set({ obstacle: e.target.value })}
            placeholder="Something else…"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={textAreaStyle}
          />
        </Step>
      ),
    },
  ]

  const isLast   = step === steps.length - 1

  const next = () => {
    // Save progress as we go, so a closed tab doesn't lose the morning.
    save(draft)
    if (isLast) {
      completeMorning(draft)
      // Deliberately does NOT call onClose here. usePersistedState performs its
      // storage write inside the state updater, so unmounting in the same tick
      // drops the write and the morning never records as done. Completing flips
      // reflections.morningDone, and ReflectionView swaps this component for the
      // morning summary on the next render — which lets the update flush.
      return
    }
    setStep(s => s + 1)
  }

  const back = () => (step === 0 ? onClose?.() : setStep(s => s - 1))

  return (
    <div className="max-w-xl mx-auto px-1 pt-2 pb-8 space-y-8">
      {/* Ritual header — quiet, not a dashboard */}
      <div className="flex items-center gap-2.5">
        <Sun size={18} strokeWidth={2} style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
          Morning · {step + 1} of {steps.length}
        </p>
      </div>

      {steps[step].render()}

      {/* Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={back}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {step === 0 ? 'Not now' : 'Back'}
        </button>

        <button
          type="button"
          onClick={next}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all active:scale-95"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {isLast ? 'Begin the day' : 'Continue'}
          {isLast ? <Check size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
        </button>
      </div>

      {/* Every question is skippable — the spec is explicit that none are mandatory */}
      {step > 0 && !isLast && (
        <button
          type="button"
          onClick={() => setStep(s => s + 1)}
          className="w-full text-center text-xs"
          style={{ color: 'var(--text-faint)' }}
        >
          Skip this
        </button>
      )}
    </div>
  )
}
