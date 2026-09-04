// Component: MoodChart
// Purpose: 30-day mood trend — smooth SVG line chart + 7-day bar overview.
//          No Card dependency — CSS variables throughout.
import { useMemo } from 'react'
import { subDays, format } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'

const MOOD_COLORS = {
  5: '#10B981', 4: '#3B6B4B', 3: '#F59E0B', 2: '#F97316', 1: '#EF4444',
}
const MOOD_LABELS = { 5: 'Great', 4: 'Good', 3: 'Okay', 2: 'Low', 1: 'Rough' }

export default function MoodChart({ mood }) {
  const days30 = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => {
      const d   = subDays(new Date(), 29 - i)
      const key = getDateKey(d)
      return { d, key, entry: mood.getMoodForDate(key), label: format(d, 'd') }
    }),
  [mood])

  const days7 = days30.slice(-7)
  const avg   = mood.getAverageScore(7)

  // SVG line chart for 30 days
  const chartW = 300
  const chartH = 80
  const pts    = days30
    .filter(d => d.entry)
    .map((d) => {
      const idx = days30.indexOf(d)
      const x   = (idx / 29) * chartW
      const y   = chartH - ((d.entry.score - 1) / 4) * (chartH - 8) - 4
      return { x, y, score: d.entry.score, key: d.key }
    })

  const pathD = pts.length > 1
    ? pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : null

  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          Mood Trends
        </p>
        <div className="flex items-center gap-3">
          {avg > 0 && (
            <span className="text-xs font-semibold" style={{ color: MOOD_COLORS[Math.round(avg)] || 'var(--accent)' }}>
              Avg {avg}/5 · {MOOD_LABELS[Math.round(avg)]}
            </span>
          )}
        </div>
      </div>

      {pts.length < 2 ? (
        <p className="text-sm italic text-center py-4" style={{ color: 'var(--text-faint)' }}>
          Log mood for a few days to see your trend line.
        </p>
      ) : (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>30-day trend</p>
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full"
            style={{ height: '80px', overflow: 'visible' }}
          >
            {/* Grid lines */}
            {[1,2,3,4,5].map(score => {
              const y = chartH - ((score - 1) / 4) * (chartH - 8) - 4
              return (
                <line
                  key={score}
                  x1={0} y1={y} x2={chartW} y2={y}
                  stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3"
                />
              )
            })}
            {/* Gradient fill under line */}
            <defs>
              <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {pathD && (
              <path
                d={`${pathD} L ${pts[pts.length-1].x} ${chartH} L ${pts[0].x} ${chartH} Z`}
                fill="url(#moodGrad)"
              />
            )}
            {/* Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Data points */}
            {pts.map(p => (
              <circle
                key={p.key}
                cx={p.x} cy={p.y} r="3.5"
                fill={MOOD_COLORS[p.score] || 'var(--accent)'}
                stroke="var(--surface)"
                strokeWidth="1.5"
              />
            ))}
          </svg>
          {/* Month labels */}
          <div className="flex justify-between mt-1">
            <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{format(subDays(new Date(), 29), 'MMM d')}</span>
            <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>Today</span>
          </div>
        </div>
      )}

      {/* 7-day emoji row */}
      <div>
        <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>Last 7 days</p>
        <div className="flex gap-1">
          {days7.map(d => (
            <div key={d.key} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full aspect-square rounded-xl flex items-center justify-center text-base transition-all"
                style={{
                  backgroundColor: d.entry ? MOOD_COLORS[d.entry.score] + '22' : 'var(--bg-secondary)',
                  border:          `1.5px solid ${d.entry ? MOOD_COLORS[d.entry.score] + '44' : 'var(--border)'}`,
                }}
              >
                {d.entry
                  ? ['','😞','😕','😐','😊','🤩'][d.entry.score]
                  : <span style={{ color: 'var(--text-faint)', fontSize: '10px' }}>–</span>
                }
              </div>
              <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{format(d.d, 'EEE')[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
