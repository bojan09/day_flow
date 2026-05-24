// Component: OnboardingFlow
// Purpose: 5-step first-run wizard — shown once to new users.
//          Steps: Welcome → Name → Starter Pack → Theme → Done
//          Seeds habits, tasks, and goals from the chosen starter pack.
import { STARTER_PACKS } from '../../hooks/useOnboarding'
import { getTodayKey } from '../../utils/dateUtils'

// ── Step components ────────────────────────────────────────────────────────────

function StepWelcome({ onNext, onSkip }) {
  return (
    <div className="flex flex-col items-center text-center py-4">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-6"
        style={{ background: 'linear-gradient(135deg, var(--accent-light), var(--accent-mid))' }}
      >
        ☀️
      </div>
      <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
        Welcome to DayFlow
      </h2>
      <p className="text-sm leading-relaxed mb-8 max-w-xs" style={{ color: 'var(--text-muted)' }}>
        Your personal planner for tasks, habits, goals, and daily reflection.
        Let's set things up in under a minute.
      </p>
      <button
        onClick={onNext}
        className="w-full py-3.5 rounded-2xl text-white font-semibold text-base mb-3 transition-all active:scale-95"
        style={{ backgroundColor: 'var(--accent)', boxShadow: '0 4px 16px rgba(59,107,75,0.3)' }}
      >
        Get started →
      </button>
      <button onClick={onSkip} className="text-sm" style={{ color: 'var(--text-faint)' }}>
        Skip setup
      </button>
    </div>
  )
}

function StepName({ name, setName, onNext, onBack }) {
  return (
    <div className="py-2">
      <h3 className="font-serif text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>
        What should we call you?
      </h3>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Your greeting will be personalised.
      </p>
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && name.trim() && onNext()}
        placeholder="Your first name…"
        className="input-base w-full mb-6"
      />
      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!name.trim()}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-all"
          style={{ backgroundColor: 'var(--accent)' }}>
          Continue →
        </button>
      </div>
    </div>
  )
}

function StepPack({ pack, setPack, onNext, onBack }) {
  return (
    <div className="py-2">
      <h3 className="font-serif text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>
        Choose a starter pack
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        We'll pre-fill habits, tasks and a goal to get you going. You can change everything later.
      </p>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {Object.entries(STARTER_PACKS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setPack(key)}
            className="flex flex-col items-start gap-1.5 p-4 rounded-2xl border text-left transition-all active:scale-95"
            style={pack === key
              ? { backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)', boxShadow: '0 0 0 2px var(--accent)' }
              : { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }
            }
          >
            <span className="text-2xl">{p.emoji}</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{p.label}</span>
            <span className="text-[11px] leading-snug" style={{ color: 'var(--text-faint)' }}>{p.desc}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
          style={{ backgroundColor: 'var(--accent)' }}>
          {pack ? 'Apply pack →' : 'Skip for now →'}
        </button>
      </div>
    </div>
  )
}

function StepTheme({ theme, setTheme, onNext, onBack }) {
  const THEMES = [
    { id: 'light',  label: 'Light',  emoji: '☀️',  bg: '#FAFAF8', text: '#2C2C2A' },
    { id: 'dark',   label: 'Dark',   emoji: '🌙',  bg: '#0F1110', text: '#EBE8E1' },
    { id: 'forest', label: 'Forest', emoji: '🌿',  bg: '#EFF5EE', text: '#2A3D2A' },
  ]
  return (
    <div className="py-2">
      <h3 className="font-serif text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>
        Pick your theme
      </h3>
      <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
        You can always change this in Settings.
      </p>
      <div className="flex gap-3 mb-6">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl border transition-all active:scale-95"
            style={theme === t.id
              ? { backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent)', boxShadow: '0 0 0 2px var(--accent)' }
              : { backgroundColor: t.bg, borderColor: 'var(--border)' }
            }
          >
            <span className="text-2xl">{t.emoji}</span>
            <span className="text-xs font-semibold" style={{ color: t.text }}>{t.label}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
          style={{ backgroundColor: 'var(--accent)' }}>
          Continue →
        </button>
      </div>
    </div>
  )
}

function StepDone({ name, pack, onFinish }) {
  const packData = pack ? STARTER_PACKS[pack] : null
  return (
    <div className="flex flex-col items-center text-center py-4">
      <div className="text-5xl mb-4 animate-spring-in">🎉</div>
      <h3 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
        You're all set{name ? `, ${name}` : ''}!
      </h3>
      <p className="text-sm leading-relaxed mb-4 max-w-xs" style={{ color: 'var(--text-muted)' }}>
        {packData
          ? `We've added your ${packData.label} starter pack — ${packData.habits.length} habits, ${packData.tasks.length} tasks, and 1 goal ready to go.`
          : 'DayFlow is ready. Start by adding your first task or habit.'}
      </p>
      {packData && (
        <div
          className="w-full rounded-2xl border p-4 mb-5 text-left space-y-1.5"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          {packData.habits.map(h => (
            <p key={h.name} className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {h.icon} {h.name}
            </p>
          ))}
        </div>
      )}
      <button
        onClick={onFinish}
        className="w-full py-3.5 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
        style={{ backgroundColor: 'var(--accent)', boxShadow: '0 4px 16px rgba(59,107,75,0.3)' }}
      >
        Start planning ✦
      </button>
    </div>
  )
}

// ── Progress dots ──────────────────────────────────────────────────────────────
function ProgressDots({ step, total }) {
  return (
    <div className="flex gap-1.5 justify-center mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="transition-all duration-300 rounded-full"
          style={{
            width:           i === step ? '20px' : '6px',
            height:          '6px',
            backgroundColor: i <= step ? 'var(--accent)' : 'var(--border)',
          }}
        />
      ))}
    </div>
  )
}

// ── Main wizard ────────────────────────────────────────────────────────────────
export default function OnboardingFlow({
  onboarding, tasks, habits, goals, onSetTheme,
}) {
  const { state, setStep, setName, setPack, setTheme, complete, skip } = onboarding
  const { step, name, pack, theme } = state

  const TOTAL_STEPS = 5

  const applyPackAndComplete = () => {
    const today = getTodayKey()

    // Apply starter pack
    if (pack && STARTER_PACKS[pack]) {
      const p = STARTER_PACKS[pack]
      p.habits.forEach(h => habits.addHabit(h))
      p.tasks.forEach(t  => tasks.addTask({ ...t, date: today }))
      p.goals.forEach(g  => goals.addGoal(g))
    }

    complete()
  }

  return (
    // Full-screen overlay
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: 'var(--overlay)' }}
    >
      <div
        className="w-full sm:max-w-md rounded-3xl p-6 animate-spring-in"
        style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-modal)' }}
      >
        <ProgressDots step={step} total={TOTAL_STEPS} />

        {step === 0 && <StepWelcome onNext={() => setStep(1)} onSkip={skip} />}
        {step === 1 && (
          <StepName
            name={name} setName={setName}
            onNext={() => setStep(2)} onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepPack
            pack={pack} setPack={setPack}
            onNext={() => setStep(3)} onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepTheme
            theme={theme}
            setTheme={(t) => { setTheme(t); onSetTheme(t) }}
            onNext={() => setStep(4)} onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepDone name={name} pack={pack} onFinish={applyPackAndComplete} />
        )}
      </div>
    </div>
  )
}
