// Component: HowItWorksSection
// Purpose: "How it works" section on landing page — 3-step process walkthrough
const STEPS = [
  {
    num: '01',
    emoji: '🌅',
    title: 'Start your morning',
    desc: 'Open DayFlow, set your daily intention, log your mood, and pick your single most important task. The whole thing takes under 2 minutes.',
  },
  {
    num: '02',
    emoji: '⚡',
    title: 'Work with focus',
    desc: 'Use the time blocker to schedule your day, run Pomodoro sessions for deep work, and check off tasks as you go. Quick Capture means you never lose a thought.',
  },
  {
    num: '03',
    emoji: '🌙',
    title: 'Close the loop',
    desc: 'Log your habits, write a quick journal entry, do your end-of-day review, and get your daily score. Tomorrow starts clear.',
  },
]

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 px-5 max-w-4xl mx-auto"
    >
      <p className="text-xs font-medium uppercase tracking-widest text-center mb-3 [color:var(--accent-text)]">
        How it works
      </p>
      <h2
        className="font-serif text-4xl sm:text-5xl text-center leading-tight tracking-tight mb-4 text-balance"
        style={{ color: 'var(--text)' }}
      >
        A complete daily system<br />in three simple steps.
      </h2>
      <p
        className="text-center max-w-md mx-auto mb-16 text-base leading-relaxed"
        style={{ color: 'var(--text-muted)' }}
      >
        DayFlow wraps around your whole day — morning intention to evening review.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connector line on desktop */}
        <div
          className="hidden md:block absolute top-10 left-[16.6%] right-[16.6%] h-px"
          style={{ backgroundColor: 'var(--border)' }}
        />

        {STEPS.map((step, i) => (
          <div
            key={step.num}
            className="flex flex-col items-center text-center opacity-0 animate-fade-up"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            {/* Number bubble */}
            <div
              className="relative w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-5 border-2 z-10"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--accent-mid)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {step.emoji}
              <span
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {step.num.replace('0', '')}
              </span>
            </div>

            <h3
              className="font-serif text-xl mb-2"
              style={{ color: 'var(--text)' }}
            >
              {step.title}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
