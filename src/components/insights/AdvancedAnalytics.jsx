// Component: AdvancedAnalytics
// Purpose: Deep analytics — energy vs productivity, burnout signal, time drift,
//          behavioural patterns. All derived from existing hook data.
import { useMemo } from 'react'
import { subDays, format } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'var(--accent)', warn = false }) {
  return (
    <div
      className="rounded-2xl border p-4 text-center"
      style={{
        backgroundColor: warn ? '#FEF3C7' : 'var(--surface)',
        borderColor:     warn ? '#FDE68A' : 'var(--border)',
        boxShadow:       'var(--shadow-card)',
      }}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: warn ? '#92400E' : 'var(--text-faint)' }}>
        {label}
      </p>
      <p className="font-serif text-2xl leading-none" style={{ color: warn ? '#B45309' : color }}>
        {value}
      </p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: warn ? '#92400E' : 'var(--text-faint)' }}>{sub}</p>}
    </div>
  )
}

function SectionHeader({ title, sub }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
        {title}
      </p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

// ── Energy vs Productivity ────────────────────────────────────────────────────

function EnergyProductivity({ tasks, energy }) {
  const data = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d       = subDays(new Date(), 13 - i)
      const dateKey = getDateKey(d)
      const dayTasks = tasks.tasks.filter(t => t.date === dateKey)
      const done     = dayTasks.filter(t => t.completed).length
      const total    = dayTasks.length
      const rate     = total > 0 ? Math.round((done / total) * 100) : null
      const e        = energy.getEnergyForDate?.(dateKey)
      const energyScore = e
        ? { morning: 3, afternoon: 2, evening: 1 }[e.window] ?? null
        : null

      return { label: format(d, 'dd'), dateKey, rate, energyScore, done, total }
    })
  }, [tasks, energy])

  const withBoth  = data.filter(d => d.rate !== null && d.energyScore !== null)
  const correlation = withBoth.length >= 3
    ? (() => {
        const avgRate   = withBoth.reduce((s, d) => s + d.rate, 0) / withBoth.length
        const avgEnergy = withBoth.reduce((s, d) => s + d.energyScore, 0) / withBoth.length
        let num = 0, den1 = 0, den2 = 0
        withBoth.forEach(d => {
          const dr = d.rate - avgRate
          const de = d.energyScore - avgEnergy
          num  += dr * de
          den1 += dr * dr
          den2 += de * de
        })
        const denom = Math.sqrt(den1 * den2)
        return denom === 0 ? 0 : Math.round((num / denom) * 100)
      })()
    : null

  const correlationLabel =
    correlation === null        ? 'Not enough data yet' :
    correlation >  60           ? '🔗 Strong positive link' :
    correlation >  20           ? '📈 Moderate link' :
    correlation < -20           ? '↕️ Inverse relationship' :
                                  '➡️ No clear pattern'

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <SectionHeader title="⚡ Energy vs Productivity" sub="Do your high-energy days produce more completed tasks?" />

      {withBoth.length < 3 ? (
        <p className="text-sm italic" style={{ color: 'var(--text-faint)' }}>
          Log your energy for a few days to see correlation.
        </p>
      ) : (
        <>
          <p className="text-sm font-medium mb-4" style={{ color: 'var(--accent)' }}>
            {correlationLabel}
          </p>
          {/* Bar chart with dual overlay */}
          <div className="flex items-end gap-1 h-20">
            {data.slice(-10).map(d => {
              const taskH   = d.rate    !== null ? (d.rate    / 100) * 72 : 0
              const energyH = d.energyScore !== null ? (d.energyScore / 3) * 72 : 0
              return (
                <div key={d.dateKey} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="flex items-end gap-0.5 w-full" style={{ height: '72px' }}>
                    <div className="flex-1 rounded-t-sm transition-all duration-500"
                      style={{ height: `${taskH}px`, backgroundColor: 'var(--accent)', minHeight: d.done > 0 ? '3px' : '0' }} />
                    <div className="flex-1 rounded-t-sm transition-all duration-500"
                      style={{ height: `${energyH}px`, backgroundColor: '#F59E0B', opacity: 0.7, minHeight: d.energyScore ? '3px' : '0' }} />
                  </div>
                  <span className="text-[8px]" style={{ color: 'var(--text-faint)' }}>{d.label}</span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-2">
            {[['Tasks %', 'var(--accent)'], ['Energy', '#F59E0B']].map(([l, c]) => (
              <div key={l} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
                <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{l}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Burnout Detection ─────────────────────────────────────────────────────────

function BurnoutSignal({ tasks, mood }) {
  const data = useMemo(() => {
    const last14 = Array.from({ length: 14 }, (_, i) => {
      const d       = subDays(new Date(), 13 - i)
      const dateKey = getDateKey(d)
      const dayTasks  = tasks.tasks.filter(t => t.date === dateKey)
      const completed = dayTasks.filter(t => t.completed).length
      const total     = dayTasks.length
      const m = mood.getMoodForDate?.(dateKey)
      return { dateKey, completed, total, moodScore: m?.score ?? null }
    })

    // Week 1 vs Week 2 comparison
    const w1 = last14.slice(0, 7)
    const w2 = last14.slice(7)

    const avgRate = (week) => {
      const withTasks = week.filter(d => d.total > 0)
      return withTasks.length > 0
        ? Math.round(withTasks.reduce((s, d) => s + (d.completed / d.total) * 100, 0) / withTasks.length)
        : null
    }

    const avgMood = (week) => {
      const withMood = week.filter(d => d.moodScore !== null)
      return withMood.length > 0
        ? (withMood.reduce((s, d) => s + d.moodScore, 0) / withMood.length).toFixed(1)
        : null
    }

    const r1 = avgRate(w1), r2 = avgRate(w2)
    const m1 = avgMood(w1), m2 = avgMood(w2)

    // Overload: more than 8 tasks added on 3+ days in last 7
    const overloadDays = w2.filter(d => d.total > 8).length

    // Decline trend
    const taskDecline = r1 !== null && r2 !== null ? r1 - r2 : null
    const moodDecline = m1 !== null && m2 !== null ? m2 - m1 : null

    return { r1, r2, m1, m2, taskDecline, moodDecline, overloadDays }
  }, [tasks, mood])

  const riskScore = [
    data.taskDecline !== null && data.taskDecline > 20 ? 2 : 0,
    data.moodDecline !== null && data.moodDecline < -0.5 ? 2 : 0,
    data.overloadDays >= 3 ? 2 : data.overloadDays >= 1 ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const riskLabel =
    riskScore >= 4 ? { text: 'High — rest and reduce load',   color: '#EF4444', emoji: '🚨' } :
    riskScore >= 2 ? { text: 'Moderate — watch your pace',    color: '#F59E0B', emoji: '⚠️' } :
                     { text: 'Low — you\'re in good shape',   color: 'var(--accent)', emoji: '✅' }

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <SectionHeader title="🔋 Burnout Signal" sub="Based on task load, completion rate, and mood trends" />

      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{riskLabel.emoji}</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: riskLabel.color }}>
            {riskLabel.text}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
            Week-over-week comparison
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'This week rate',  value: data.r2 !== null ? `${data.r2}%` : '—', prev: data.r1 !== null ? `prev ${data.r1}%` : null },
          { label: 'Avg mood',        value: data.m2 !== null ? `${data.m2}/5` : '—', prev: data.m1 !== null ? `prev ${data.m1}` : null },
          { label: 'Heavy days',      value: data.overloadDays,                        prev: '8+ tasks' },
        ].map(s => (
          <div key={s.label}
            className="rounded-xl p-3 text-center border"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>{s.label}</p>
            <p className="font-serif text-xl" style={{ color: 'var(--text)' }}>{s.value}</p>
            {s.prev && <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{s.prev}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Behavioural Insights ──────────────────────────────────────────────────────

function BehaviouralInsights({ tasks }) {
  const insights = useMemo(() => {
    const list = []
    const allCompleted = tasks.tasks.filter(t => t.completed && t.completedAt)

    if (allCompleted.length < 5) return list

    // Best day of week
    const byDow = allCompleted.reduce((acc, t) => {
      const dow = new Date(t.completedAt).getDay()
      acc[dow] = (acc[dow] || 0) + 1
      return acc
    }, {})
    const bestDow = Object.entries(byDow).sort((a, b) => b[1] - a[1])[0]
    const dowNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    if (bestDow) {
      list.push({ icon: '📅', text: `You complete the most tasks on ${dowNames[bestDow[0]]}s` })
    }

    // Most productive category
    const byCat = allCompleted.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1
      return acc
    }, {})
    const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]
    if (topCat) {
      list.push({ icon: '🏷️', text: `Your most completed category is "${topCat[0]}" (${topCat[1]} tasks)` })
    }

    // Completion time of day
    const byHour = allCompleted.reduce((acc, t) => {
      const h = new Date(t.completedAt).getHours()
      const window = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
      acc[window] = (acc[window] || 0) + 1
      return acc
    }, {})
    const topWindow = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0]
    if (topWindow) {
      list.push({ icon: '⏰', text: `You tend to complete tasks in the ${topWindow[0]}` })
    }

    // Same-day completion rate
    const sameDay = allCompleted.filter(t => t.date === getDateKey(new Date(t.completedAt))).length
    const sameDayPct = Math.round((sameDay / allCompleted.length) * 100)
    list.push({
      icon: '⚡',
      text: `${sameDayPct}% of your tasks are completed on the day they're scheduled`,
    })

    return list
  }, [tasks])

  if (insights.length === 0) return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <SectionHeader title="🔍 Behavioural Insights" />
      <p className="text-sm italic" style={{ color: 'var(--text-faint)' }}>
        Complete more tasks to unlock personal insights about your patterns.
      </p>
    </div>
  )

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <SectionHeader title="🔍 Behavioural Insights" sub="Patterns derived from your task history" />
      <div className="space-y-3">
        {insights.map((ins, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">{ins.icon}</span>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{ins.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AdvancedAnalytics({ tasks, mood, energy, habits }) {
  const last30 = Array.from({ length: 30 }, (_, i) => getDateKey(subDays(new Date(), i)))
  const tasksDone30   = tasks.tasks.filter(t => last30.includes(t.date) && t.completed).length
  const avgPerDay     = (tasksDone30 / 30).toFixed(1)
  const longestStreak = (() => {
    let best = 0, cur = 0
    for (let i = 29; i >= 0; i--) {
      const d = getDateKey(subDays(new Date(), i))
      if (tasks.tasks.some(t => t.date === d && t.completed)) { cur++; best = Math.max(best, cur) }
      else cur = 0
    }
    return best
  })()

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Tasks / day"    value={avgPerDay}      sub="30-day avg"   />
        <StatCard label="Longest streak" value={longestStreak}  sub="days"         />
        <StatCard label="Last 30 days"   value={tasksDone30}    sub="completed"    />
      </div>

      <EnergyProductivity tasks={tasks} energy={energy} />
      <BurnoutSignal tasks={tasks} mood={mood} />
      <BehaviouralInsights tasks={tasks} />
    </div>
  )
}
