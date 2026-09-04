// Component: EveningReview
// Purpose: "Close your day" — the evening half of the ritual.
//          Flow per the spec: REVIEW → LEARN → REFLECT → CARRY FORWARD → CLOSE.
//
// Tone is deliberately different from the morning: the morning prepares, the
// evening reflects and releases. Nothing here scores the day.
import { useState } from 'react'
import { Moon, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react'
import { getTodayKey } from '../../utils/dateUtils'
import { selectReference } from '../../services/stoicThemeSelection'
import { buildDaySummary, summaryLines, hasEnoughContextForAI } from '../../services/daySummary'
import { usePomodoroHistory } from '../../hooks/usePomodoroHistory'
import { useFasting } from '../../hooks/useFasting'
import { callClaude } from '../../services/aiService'

const FEELINGS = ['Calm', 'Good', 'Easy', 'Focused', 'Challenging', 'Scattered', 'Stressful', 'Difficult']

const LIVED = [
  { id: 'yes',       label: 'Yes' },
  { id: 'partially', label: 'Partially' },
  { id: 'not_today', label: 'Not today' },
]

const fieldStyle = {
  backgroundColor: 'var(--bg)',
  borderColor:     'var(--border)',
  color:           'var(--text)',
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

function Chips({ options, value, onChange, idKey = 'id', labelKey = 'label' }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const id    = typeof opt === 'string' ? opt : opt[idKey]
        const label = typeof opt === 'string' ? opt : opt[labelKey]
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(active ? '' : id)}
            className="px-4 py-2 rounded-full text-sm font-medium border transition-all active:scale-95"
            style={active
              ? { backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }
              : { backgroundColor: 'var(--surface)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
            aria-pressed={active}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default function EveningReview({ reflections, tasks, habits, routines, onClose, dateKey = getTodayKey() }) {
  const { entry, save, completeEvening } = reflections
  const pomodoro = usePomodoroHistory()
  const fasting  = useFasting()

  const focusSessions = pomodoro?.getTodaySessions?.() ?? []
  const summary = buildDaySummary({ tasks, habits, routines, focusSessions, fastingRecords: fasting.records, reflection: entry, dateKey })
  const lines   = summaryLines(summary)

  // Evening reference may take a different theme from the morning — the day's
  // outcome is now known, so the context is different.
  const reference = selectReference(`${dateKey}-evening`, {
    overdueCount: tasks?.tasks?.filter(t => tasks.isOverdue?.(t)).length ?? 0,
    todayTaskCount: summary.tasks.total,
    yesterdayLivedIntention: entry.livedIntention,
    hasCarryForward: false,
  })

  const [step, setStep]   = useState(0)
  const [draft, setDraft] = useState({
    livedIntention: entry.livedIntention || '',
    wentWell:       entry.wentWell || '',
    didntGoPlanned: entry.didntGoPlanned || '',
    lesson:         entry.lesson || '',
    dayFelt:        entry.dayFelt || '',
    carryForward:   entry.carryForward || '',
    aiReflection:   entry.aiReflection || '',
  })
  const [ai, setAi] = useState({ loading: false, error: null })

  const set = (patch) => setDraft(d => ({ ...d, ...patch }))

  // Grounded strictly in what actually happened and what the user wrote.
  const requestReflection = async () => {
    setAi({ loading: true, error: null })
    const facts = [
      entry.intention ? `Morning intention: ${entry.intention}` : null,
      summary.priority ? `Stated priority: ${summary.priority}${summary.priorityDone === null ? '' : summary.priorityDone ? ' (completed)' : ' (not finished)'}` : null,
      summary.tasks.total ? `Tasks: ${summary.tasks.completed} of ${summary.tasks.total} completed` : null,
      summary.focusSessions ? `Focus sessions: ${summary.focusSessions} (${summary.focusMinutes} minutes)` : null,
      summary.habits.total ? `Habits: ${summary.habits.completed} of ${summary.habits.total}` : null,
      summary.fastingMs ? `Fasted: ${Math.round(summary.fastingMs / 3600000 * 10) / 10} hours` : null,
      draft.livedIntention ? `Lived according to intention: ${draft.livedIntention.replace('_', ' ')}` : null,
      draft.wentWell ? `What went well: ${draft.wentWell}` : null,
      draft.didntGoPlanned ? `What didn't go as planned: ${draft.didntGoPlanned}` : null,
      draft.lesson ? `What today taught them: ${draft.lesson}` : null,
      draft.dayFelt ? `The day felt: ${draft.dayFelt}` : null,
    ].filter(Boolean).join('\n')

    try {
      const text = await callClaude(
        `You write a short evening reflection for a personal productivity app, in a calm Stoic spirit.

Rules:
- 3 short sentences maximum. No headings, no lists, no preamble.
- Use ONLY the facts given. Never invent events, numbers or feelings.
- Non-judgmental. Never praise or scold. "Not today" is not failure.
- Do not diagnose emotions or mental health.
- End with at most one concrete, small suggestion for tomorrow — only if the facts support it.
- Address the person as "you".`,
        facts,
      )
      const clean = (text || '').trim()
      if (clean) {
        set({ aiReflection: clean })
        save({ aiReflection: clean })
      }
      setAi({ loading: false, error: clean ? null : 'No reflection came back.' })
    } catch (err) {
      setAi({ loading: false, error: err?.message || 'Could not generate a reflection.' })
    }
  }

  const steps = [
    // ── REVIEW ──────────────────────────────────────────────────────────────
    {
      key: 'review',
      render: () => (
        <Step title="Good evening" hint="Take a moment to understand today before letting it go.">
          <figure
            className="rounded-2xl border p-5 space-y-2"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <blockquote className="font-serif text-xl leading-relaxed" style={{ color: 'var(--text)' }}>
              “{reference.quote}”
            </blockquote>
            <figcaption className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {reference.author} — {reference.work}{reference.section ? `, ${reference.section}` : ''}
            </figcaption>
          </figure>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Today is finished. What matters now is what you take from it.
          </p>

          {lines.length > 0 && (
            <div
              className="rounded-2xl border divide-y"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest px-4 pt-3 pb-2" style={{ color: 'var(--text-faint)' }}>
                Your day
              </p>
              {lines.map(l => (
                <div key={l.label} className="flex items-center justify-between px-4 py-2.5" style={{ borderColor: 'var(--border-soft)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{l.label}</span>
                  <span className="text-sm font-medium text-right" style={{ color: 'var(--text)' }}>{l.value}</span>
                </div>
              ))}
            </div>
          )}
        </Step>
      ),
    },

    // ── INTENTION CHECK ─────────────────────────────────────────────────────
    {
      key: 'lived',
      render: () => (
        <Step
          title={entry.intention ? `You wanted to be ${String(entry.intention).toLowerCase()}. Did you live that today?` : 'Did you live according to your intention?'}
          hint="This is reflection, not a verdict."
        >
          <Chips options={LIVED} value={draft.livedIntention} onChange={v => set({ livedIntention: v })} />
        </Step>
      ),
    },

    // ── LEARN ───────────────────────────────────────────────────────────────
    {
      key: 'learn',
      render: () => (
        <Step title="What went well today?" hint="However small.">
          <textarea
            value={draft.wentWell}
            onChange={e => set({ wentWell: e.target.value })}
            rows={3}
            placeholder="Something that worked…"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none leading-relaxed"
            style={fieldStyle}
          />
        </Step>
      ),
    },
    {
      key: 'friction',
      render: () => (
        <Step title="What didn't go as planned?" hint="Describe it plainly — no need to explain it away.">
          <textarea
            value={draft.didntGoPlanned}
            onChange={e => set({ didntGoPlanned: e.target.value })}
            rows={3}
            placeholder="What got in the way…"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none leading-relaxed"
            style={fieldStyle}
          />
        </Step>
      ),
    },
    {
      key: 'lesson',
      render: () => (
        <Step title="What did today teach you?" hint="One sentence is enough.">
          <textarea
            value={draft.lesson}
            onChange={e => set({ lesson: e.target.value })}
            rows={3}
            placeholder="Today taught me…"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none leading-relaxed"
            style={fieldStyle}
          />
          <div className="space-y-2 pt-1">
            <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>How did the day feel?</p>
            <Chips options={FEELINGS} value={draft.dayFelt} onChange={v => set({ dayFelt: v })} />
          </div>
        </Step>
      ),
    },

    // ── REFLECT (optional AI) ───────────────────────────────────────────────
    {
      key: 'reflect',
      render: () => {
        const eligible = hasEnoughContextForAI(summary, draft)
        return (
          <Step
            title="Today's reflection"
            hint={eligible
              ? 'Optional. Built only from what actually happened and what you wrote.'
              : 'Your own words are the reflection — there is nothing to add to them yet.'}
          >
            {draft.aiReflection && (
              <div
                className="rounded-2xl border p-4"
                style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)' }}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--accent-text)' }}>
                  {draft.aiReflection}
                </p>
              </div>
            )}

            {eligible && !draft.aiReflection && (
              <button
                type="button"
                onClick={requestReflection}
                disabled={ai.loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all active:scale-95 disabled:opacity-60"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--surface)' }}
              >
                <Sparkles size={15} aria-hidden="true" />
                {ai.loading ? 'Reflecting…' : 'Add a reflection'}
              </button>
            )}

            {ai.error && (
              <p className="text-xs" style={{ color: 'var(--tone-red-text)' }}>{ai.error}</p>
            )}
          </Step>
        )
      },
    },

    // ── CARRY FORWARD ───────────────────────────────────────────────────────
    {
      key: 'carry',
      render: () => (
        <Step title="What should tomorrow remember?" hint="One thing. You'll see it first thing in the morning.">
          <textarea
            value={draft.carryForward}
            onChange={e => set({ carryForward: e.target.value })}
            rows={3}
            placeholder="Don't check messages before the first focus session…"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none leading-relaxed"
            style={fieldStyle}
          />
        </Step>
      ),
    },
  ]

  const isLast = step === steps.length - 1

  const next = () => {
    save(draft)
    if (isLast) {
      // As in the morning: no navigation here. usePersistedState writes inside
      // the state updater, so unmounting in the same tick loses the write.
      completeEvening(draft)
      return
    }
    setStep(s => s + 1)
  }

  const back = () => (step === 0 ? onClose?.() : setStep(s => s - 1))

  return (
    <div className="max-w-xl mx-auto px-1 pt-2 pb-8 space-y-8">
      <div className="flex items-center gap-2.5">
        <Moon size={18} strokeWidth={2} style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
          Evening · {step + 1} of {steps.length}
        </p>
      </div>

      {steps[step].render()}

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
          {isLast ? 'Close the day' : 'Continue'}
          {isLast ? <Check size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
        </button>
      </div>

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
