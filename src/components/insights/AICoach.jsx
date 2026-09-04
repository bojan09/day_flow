// Component: AICoach
// Purpose: AI-powered features using the Anthropic API —
//          Weekly Coach, Auto-Journal, and Goal Breakdown.
//          Each feature builds a rich context from the user's real data.
import { useState } from 'react'
import { callClaude } from '../../services/aiService'
import { format, subDays } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'

// ── Data summariser — builds a compact context string from user data ──────────

function buildWeekContext({ tasks, habits, mood, notes, goals }) {
  const last7 = Array.from({ length: 7 }, (_, i) => getDateKey(subDays(new Date(), i)))

  const weekTasks = tasks.tasks.filter(t => last7.includes(t.date))
  const done      = weekTasks.filter(t => t.completed).length
  const total     = weekTasks.length
  const moodHistory = last7.map(d => mood.getMoodForDate?.(d)).filter(Boolean)
  const avgMood   = moodHistory.length
    ? (moodHistory.reduce((s, m) => s + m.score, 0) / moodHistory.length).toFixed(1)
    : null
  const maxStreak  = habits.getMaxStreak()
  const recentNote = notes.notes[0]
  const activeGoals = goals.goals.filter(g => !g.completed).slice(0, 3)

  return `
USER WEEKLY SNAPSHOT (${format(new Date(), 'MMM d, yyyy')}):
- Tasks: ${done}/${total} completed this week
- Habits: max streak ${maxStreak} days
- Mood average: ${avgMood ? `${avgMood}/5` : 'not logged'}
- Active goals: ${activeGoals.map(g => g.title).join(', ') || 'none'}
- Recent note: "${recentNote?.title || 'none'}"
`.trim()
}

function buildGoalContext(goal) {
  const milestones = goal.milestones?.map(m => `  - ${m.text} (${m.done ? 'done' : 'pending'})`).join('\n') || 'none'
  return `
GOAL: "${goal.title}"
Type: ${goal.type} | Category: ${goal.category}
Description: ${goal.description || 'none'}
Current milestones:\n${milestones}
`.trim()
}

// ── Weekly Coach ───────────────────────────────────────────────────────────────

function WeeklyCoach({ tasks, habits, mood, notes, goals }) {
  const [output,  setOutput]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const generate = async () => {
    setLoading(true); setError(null); setOutput('')
    try {
      const context = buildWeekContext({ tasks, habits, mood, notes, goals })
      const text    = await callClaude(
        `You are a warm, concise personal productivity coach. 
Given the user's weekly data, provide:
1. A one-sentence observation about what went well
2. One specific, actionable suggestion for next week
3. A short motivating closing line

Keep the total response under 120 words. Be direct and personal, not generic.`,
        context
      )
      setOutput(text)
    } catch {
      setError('Could not reach AI. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FeatureCard
      title="🤖 Weekly Coach"
      desc="Get a personalised insight and action for next week based on your data."
      buttonLabel="Generate coaching"
      loading={loading}
      output={output}
      error={error}
      onGenerate={generate}
    />
  )
}

// ── Auto Journal ──────────────────────────────────────────────────────────────

function AutoJournal({ tasks, habits, mood, notes }) {
  const [output,  setOutput]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const generate = async () => {
    setLoading(true); setError(null); setOutput('')
    try {
      const today    = getDateKey(new Date())
      const dayTasks = tasks.tasks.filter(t => t.date === today)
      const done     = dayTasks.filter(t => t.completed)
      const pending  = dayTasks.filter(t => !t.completed)
      const todayMood = mood.getTodayMood?.()
      const context   = `
TODAY (${format(new Date(), 'EEEE, MMMM d')}):
Completed tasks: ${done.map(t => t.title).join(', ') || 'none'}
Pending tasks: ${pending.map(t => t.title).join(', ') || 'none'}
Mood: ${todayMood ? `${todayMood.score}/5` : 'not logged'}
Habits done: ${habits.habits.filter(h => habits.isHabitDone(h.id)).length}/${habits.habits.length}
`.trim()
      const text = await callClaude(
        `You are a journaling assistant. Write a short, reflective first-person journal entry 
(80–120 words) based on the user's day. 
Use past tense. Sound natural, not robotic. 
Start with "Today, " or "This [day of week], ". 
Include a brief reflection on what was accomplished and a positive forward-looking thought.`,
        context
      )
      setOutput(text)
    } catch {
      setError('Could not reach AI. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FeatureCard
      title="📓 Auto Journal"
      desc="Generate a journal entry based on what you actually did today."
      buttonLabel="Write today's entry"
      loading={loading}
      output={output}
      error={error}
      onGenerate={generate}
    />
  )
}

// ── Goal Breakdown ────────────────────────────────────────────────────────────

function GoalBreakdown({ goals }) {
  const [selectedId, setSelectedId] = useState('')
  const [output,  setOutput]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const activeGoals = goals.goals.filter(g => !g.completed)

  const generate = async () => {
    const goal = activeGoals.find(g => g.id === selectedId)
    if (!goal) return
    setLoading(true); setError(null); setOutput('')
    try {
      const context = buildGoalContext(goal)
      const text    = await callClaude(
        `You are a goal-planning coach. Given the user's goal, provide:
1. 3–5 concrete, specific milestones that break the goal into phases
2. The single most important first action they can take this week
3. One potential obstacle and how to pre-empt it

Format as plain text with clear sections. Keep under 200 words. Be specific, not vague.`,
        context
      )
      setOutput(text)
    } catch {
      setError('Could not reach AI. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>
        🎯 Goal Breakdown
      </p>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        Turn a goal into a concrete action plan.
      </p>

      {activeGoals.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--text-faint)' }}>
          Create a goal first to use this feature.
        </p>
      ) : (
        <>
          <select
            value={selectedId}
            onChange={e => { setSelectedId(e.target.value); setOutput('') }}
            className="input-base w-full mb-3 text-sm"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <option value="">Select a goal…</option>
            {activeGoals.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>

          <button
            onClick={generate}
            disabled={!selectedId || loading}
            className="w-full py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Breaking down goal…
              </span>
            ) : 'Generate action plan'}
          </button>

          {error  && <p className="text-xs text-red-500 mt-2">{error}</p>}
          {output && <OutputBox text={output} />}
        </>
      )}
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function OutputBox({ text }) {
  return (
    <div
      className="mt-3 rounded-xl p-4 border text-sm leading-relaxed whitespace-pre-wrap animate-fade-in"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor:     'var(--border)',
        color:           'var(--text)',
        fontFamily:      '"Cormorant Garamond", Georgia, serif',
        fontSize:        '0.95rem',
      }}
    >
      {text}
    </div>
  )
}

function FeatureCard({ title, desc, buttonLabel, loading, output, error, onGenerate }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>
        {title}
      </p>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{desc}</p>

      <button
        onClick={onGenerate}
        disabled={loading}
        className="w-full py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Thinking…
          </span>
        ) : buttonLabel}
      </button>

      {error  && <p className="text-xs text-red-500 mt-2">{error}</p>}
      {output && <OutputBox text={output} />}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AICoach({ tasks, habits, mood, notes, goals }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 px-1">
        <span className="text-xl flex-shrink-0">🤖</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>AI Features</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Powered by Claude. All insights are generated from your actual data — nothing is made up.
          </p>
        </div>
      </div>

      <WeeklyCoach tasks={tasks} habits={habits} mood={mood} notes={notes} goals={goals} />
      <AutoJournal tasks={tasks} habits={habits} mood={mood} notes={notes} />
      <GoalBreakdown goals={goals} />
    </div>
  )
}
