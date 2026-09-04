// Component: FastingView
// Purpose: The dedicated Fasting page. The top of the page answers, in order:
//          am I fasting, how long, when does it end, how much is left, what is
//          my streak — which is exactly what the spec asks for.
//
// Calm rather than gamified: no badges, no confetti, no "you failed".
import { useState } from 'react'
import { Utensils, Play, Square, History, Settings2 } from 'lucide-react'
import Modal from '../ui/Modal'
import { useFasting } from '../../hooks/useFasting'
import { PRESETS, FEELINGS, formatDuration } from '../../services/fastingModel'
import { selectReference } from '../../services/stoicThemeSelection'
import { getTodayKey } from '../../utils/dateUtils'

const clockAt = (ms) =>
  new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <p className="font-serif text-2xl" style={{ color: 'var(--text)' }}>{value}</p>
      <p className="text-[11px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-faint)' }}>{label}</p>
    </div>
  )
}

export default function FastingView() {
  const fasting = useFasting()
  const { plan, active, progress, stats } = fasting

  const [planOpen, setPlanOpen] = useState(false)
  const [endOpen,  setEndOpen]  = useState(false)
  const [draftPreset, setDraftPreset] = useState(plan?.presetId || '16:8')
  const [draftHours,  setDraftHours]  = useState(plan?.fastHours || 16)
  const [draftDays,   setDraftDays]   = useState(plan?.challengeDays || '')
  const [endNote, setEndNote] = useState('')
  const [endFeel, setEndFeel] = useState('')

  // Reuses the curated, attributed Stoic set rather than a second quote store.
  const reference = selectReference(`${getTodayKey()}-fasting`, {})

  const savePlan = () => {
    fasting.savePlan({
      presetId: draftPreset,
      fastHours: draftPreset === 'custom' ? Number(draftHours) || 16 : undefined,
      challengeDays: draftDays ? Number(draftDays) : null,
    })
    setPlanOpen(false)
  }

  const confirmEnd = () => {
    fasting.end({ note: endNote, feeling: endFeel })
    setEndNote(''); setEndFeel('')
    setEndOpen(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pt-2 pb-4">

      {/* ── Dashboard ────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-6 space-y-4"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {active ? (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--accent-text)' }}>
              Fasting
            </p>
            <div>
              <p className="font-serif text-5xl leading-none" style={{ color: 'var(--text)' }}>
                {formatDuration(progress.elapsedMs)}
              </p>
              <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
                of {active.targetHours} hours
              </p>
            </div>

            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
              role="progressbar"
              aria-valuenow={Math.min(100, progress.percent)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, progress.percent)}%`, backgroundColor: 'var(--accent)' }}
              />
            </div>

            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {progress.reachedTarget
                ? `Target reached — ${formatDuration(progress.elapsedMs - progress.targetMs)} past ${active.targetHours}h`
                : `${formatDuration(progress.remainingMs)} remaining · ends at ${clockAt(active.targetEndsAt)}`}
            </p>

            <button
              type="button"
              onClick={() => setEndOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all active:scale-95"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Square size={15} aria-hidden="true" /> End fast
            </button>
          </>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
              Not fasting
            </p>
            <p className="font-serif text-2xl" style={{ color: 'var(--text)' }}>
              {plan ? `${plan.fastHours}:${plan.eatHours} — fast ${plan.fastHours}h each cycle` : 'No plan yet'}
            </p>
            {plan?.challengeDays && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Following this schedule for {plan.challengeDays} days — that is the challenge length,
                not one continuous fast.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fasting.begin()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all active:scale-95"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Play size={15} aria-hidden="true" /> Start fasting
              </button>
              <button
                type="button"
                onClick={() => setPlanOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all active:scale-95"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <Settings2 size={15} aria-hidden="true" /> {plan ? 'Change plan' : 'Choose a plan'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Consistency — neutral, never scolding ────────────────────────── */}
      <div
        className="rounded-2xl border p-5 grid grid-cols-3 gap-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <Stat label="Current streak" value={stats.currentStreak} />
        <Stat label="This month"     value={stats.daysThisMonth} />
        <Stat label="Longest fast"   value={stats.longestMs ? formatDuration(stats.longestMs) : '—'} />
      </div>

      {/* ── A quiet motivational line, from the curated set ──────────────── */}
      {reference && (
        <figure
          className="rounded-2xl border p-5 space-y-2"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <blockquote className="font-serif text-lg leading-relaxed" style={{ color: 'var(--text)' }}>
            “{reference.quote}”
          </blockquote>
          <figcaption className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {reference.author} — {reference.work}{reference.section ? `, ${reference.section}` : ''}
          </figcaption>
        </figure>
      )}

      {/* ── History ──────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <History size={15} style={{ color: 'var(--text-faint)' }} aria-hidden="true" />
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            History
          </p>
        </div>

        {fasting.records.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No fasts recorded yet.</p>
        ) : (
          <div className="space-y-1.5">
            {fasting.records.slice(0, 10).map(r => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border px-4 py-2.5"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="min-w-0">
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{formatDuration(r.actualMs)}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                    {r.dateKey} · target {r.targetHours}h{r.feeling ? ` · ${r.feeling}` : ''}
                  </p>
                </div>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                  style={r.completed
                    ? { backgroundColor: 'var(--tone-sage-bg)',  color: 'var(--tone-sage-text)' }
                    : { backgroundColor: 'var(--bg-secondary)',  color: 'var(--text-muted)' }}
                >
                  {r.completed ? 'Reached target' : 'Ended early'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Plan modal ───────────────────────────────────────────────────── */}
      <Modal isOpen={planOpen} onClose={() => setPlanOpen(false)} title="Fasting plan" fullScreenOnMobile>
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Fasting window
            </p>
            <div className="flex flex-wrap gap-2">
              {[...PRESETS, { id: 'custom', label: 'Custom' }].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setDraftPreset(p.id)}
                  className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                  style={draftPreset === p.id
                    ? { backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }
                    : { backgroundColor: 'var(--surface)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {draftPreset === 'custom' && (
              <input
                type="number" min="1" max="36"
                value={draftHours}
                onChange={e => setDraftHours(e.target.value)}
                placeholder="Hours to fast"
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Challenge length (optional)
            </p>
            <input
              type="number" min="1" max="365"
              value={draftDays}
              onChange={e => setDraftDays(e.target.value)}
              placeholder="e.g. 30 days"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
              How many days you want to follow this schedule. It does not change the length of a
              single fast — a 30-day challenge is 30 days of your chosen window, not one 30-day fast.
            </p>
          </div>

          <button
            type="button"
            onClick={savePlan}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Save plan
          </button>
        </div>
      </Modal>

      {/* ── End-of-fast reflection ───────────────────────────────────────── */}
      <Modal isOpen={endOpen} onClose={() => setEndOpen(false)} title="End this fast" fullScreenOnMobile>
        <div className="space-y-5">
          {progress && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {formatDuration(progress.elapsedMs)} fasted
              {progress.reachedTarget ? ' — target reached.' : ` of a ${active?.targetHours}h target.`}
            </p>
          )}

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              How did it go?
            </p>
            <div className="flex flex-wrap gap-2">
              {FEELINGS.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setEndFeel(endFeel === f ? '' : f)}
                  className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                  style={endFeel === f
                    ? { backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }
                    : { backgroundColor: 'var(--surface)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={endNote}
            onChange={e => setEndNote(e.target.value)}
            rows={3}
            placeholder="Anything worth remembering (optional)"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmEnd}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              End and save
            </button>
            <button
              type="button"
              onClick={() => { fasting.cancel(); setEndOpen(false) }}
              className="px-4 py-3 rounded-xl text-sm font-medium border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              title="Discard without recording — for a fast started by mistake"
            >
              Discard
            </button>
          </div>
        </div>
      </Modal>

      {/* Footer marker so the page never looks empty on first visit */}
      {!plan && !active && fasting.records.length === 0 && (
        <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-faint)' }}>
          <Utensils size={13} aria-hidden="true" /> Choose a plan to begin tracking.
        </p>
      )}
    </div>
  )
}
