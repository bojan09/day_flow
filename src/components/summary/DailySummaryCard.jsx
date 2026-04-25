// Component: DailySummaryCard
// Purpose: Complete daily recap — tasks done, habits hit, mood, water, XP earned.
//          Shown in InsightsView and surfaced in Today's evening mode.
import { format, subDays } from 'date-fns'
import { getTodayKey, getDateKey } from '../../utils/dateUtils'

function StatPill({ label, value, sub, color = 'var(--accent)' }) {
  return (
    <div
      className="flex-1 flex flex-col items-center gap-0.5 py-3 rounded-2xl border text-center"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <span className="font-serif text-2xl leading-none" style={{ color }}>{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
        {label}
      </span>
      {sub && <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{sub}</span>}
    </div>
  )
}

function DayBar({ label, pct, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-8 text-right flex-shrink-0" style={{ color: 'var(--text-faint)' }}>
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color || 'var(--accent)' }}
        />
      </div>
      <span className="text-[10px] w-7 text-left flex-shrink-0 font-medium" style={{ color: 'var(--text-muted)' }}>
        {pct}%
      </span>
    </div>
  )
}

export default function DailySummaryCard({ tasks, habits, mood, water, xp }) {
  const today = getTodayKey()

  // ── Task stats ────────────────────────────────────────────────────────────
  const todayTasks  = tasks.tasks.filter(t => t.date === today)
  const tasksDone   = todayTasks.filter(t => t.completed).length
  const tasksTotal  = todayTasks.length
  const taskPct     = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0

  // ── Habit stats ───────────────────────────────────────────────────────────
  const habitPct    = habits.getTodayCompletion()
  const habitsDone  = habits.habits.filter(h => habits.isHabitDone(h.id, today)).length
  const habitsTotal = habits.habits.length

  // ── Mood ──────────────────────────────────────────────────────────────────
  const todayMood   = mood.getTodayMood()
  const moodLabels  = ['', 'Rough', 'Low', 'Okay', 'Good', 'Great']
  const moodEmojis  = ['', '😞', '😕', '😐', '😊', '🤩']

  // ── Water ─────────────────────────────────────────────────────────────────
  const waterData   = water?.getProgress()

  // ── XP ────────────────────────────────────────────────────────────────────
  const levelInfo   = xp?.getLevelInfo()

  // ── Last 7 days trend ────────────────────────────────────────────────────
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d       = subDays(new Date(), 6 - i)
    const dateKey = getDateKey(d)
    const dayTasks = tasks.tasks.filter(t => t.date === dateKey)
    const done     = dayTasks.filter(t => t.completed).length
    const total    = dayTasks.length
    return {
      label: format(d, 'EEE'),
      pct:   total > 0 ? Math.round((done / total) * 100) : 0,
      isToday: dateKey === today,
    }
  })

  const GRADE = taskPct >= 90 ? 'A' : taskPct >= 75 ? 'B' : taskPct >= 60 ? 'C' : taskPct >= 40 ? 'D' : 'F'
  const GRADE_COLOR = { A: '#3B6B4B', B: '#3B82F6', C: '#F59E0B', D: '#F97316', F: '#EF4444' }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div
        className="px-5 pt-5 pb-4 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            📊 Daily Summary
          </p>
          <p className="font-serif text-lg mt-0.5" style={{ color: 'var(--text)' }}>
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        {/* Grade badge */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center border-2"
          style={{
            backgroundColor: GRADE_COLOR[GRADE] + '18',
            borderColor:     GRADE_COLOR[GRADE] + '40',
          }}
        >
          <span
            className="font-serif text-2xl font-bold"
            style={{ color: GRADE_COLOR[GRADE] }}
          >
            {tasksDone === 0 && habitsTotal === 0 ? '–' : GRADE}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex gap-2 mb-4">
          <StatPill
            label="Tasks"
            value={`${tasksDone}/${tasksTotal}`}
            sub={tasksTotal > 0 ? `${taskPct}%` : 'none set'}
          />
          <StatPill
            label="Habits"
            value={`${habitsDone}/${habitsTotal}`}
            sub={`${habitPct}%`}
            color="#7C3AED"
          />
          {todayMood && (
            <StatPill
              label="Mood"
              value={moodEmojis[todayMood.score] || todayMood.score}
              sub={moodLabels[todayMood.score]}
              color="#F59E0B"
            />
          )}
          {waterData && (
            <StatPill
              label="Water"
              value={waterData.count}
              sub={`/ ${waterData.goal}`}
              color="#3B82F6"
            />
          )}
        </div>

        {/* Category breakdown */}
        {todayTasks.length > 0 && (
          <div className="space-y-1.5 mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-faint)' }}>
              By category
            </p>
            {Object.entries(
              todayTasks.reduce((acc, t) => {
                acc[t.category] = acc[t.category] || { done: 0, total: 0 }
                acc[t.category].total++
                if (t.completed) acc[t.category].done++
                return acc
              }, {})
            ).map(([cat, { done, total }]) => (
              <DayBar
                key={cat}
                label={cat.slice(0, 6)}
                pct={Math.round((done / total) * 100)}
              />
            ))}
          </div>
        )}

        {/* 7-day task completion trend */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-faint)' }}>
            7-day trend
          </p>
          <div className="flex items-end justify-between gap-1 h-12">
            {last7.map(d => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm transition-all duration-500"
                  style={{
                    height:          `${Math.max((d.pct / 100) * 40, d.pct > 0 ? 6 : 2)}px`,
                    backgroundColor: d.isToday ? 'var(--accent)' : 'var(--border)',
                    opacity:         d.pct === 0 ? 0.3 : 1,
                  }}
                />
                <span
                  className="text-[9px]"
                  style={{
                    color:      d.isToday ? 'var(--accent)' : 'var(--text-faint)',
                    fontWeight: d.isToday ? 700 : 400,
                  }}
                >
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* XP progress strip */}
        {levelInfo && (
          <div
            className="mt-4 pt-3 border-t flex items-center gap-3"
            style={{ borderColor: 'var(--border-soft)' }}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Level {levelInfo.level} — {levelInfo.title}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  {levelInfo.totalXP} XP
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${levelInfo.progress}%`, backgroundColor: 'var(--accent)' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
