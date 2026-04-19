// Component: BalanceWheel
// Purpose: Radar chart + sliders for rating 8 life areas monthly
import { useState } from 'react'
import { LIFE_AREAS } from '../../hooks/useBalanceWheel'
import { format } from 'date-fns'

function RadarChart({ ratings, size = 220 }) {
  const n          = LIFE_AREAS.length
  const cx         = size / 2
  const cy         = size / 2
  const maxR       = size / 2 - 28
  const levels     = [2, 4, 6, 8, 10]
  const angleStep  = (2 * Math.PI) / n
  const startAngle = -Math.PI / 2

  const toXY = (i, val) => {
    const angle = startAngle + i * angleStep
    const r = (val / 10) * maxR
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  const labelXY = (i) => {
    const angle = startAngle + i * angleStep
    const r = maxR + 18
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  const polygonPoints = LIFE_AREAS
    .map((a, i) => { const { x, y } = toXY(i, ratings[a.id] || 5); return `${x},${y}` })
    .join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto block">
      {/* Grid rings */}
      {levels.map(l => (
        <circle
          key={l} cx={cx} cy={cy} r={(l / 10) * maxR}
          fill="none" stroke="var(--border)" strokeWidth="0.75"
        />
      ))}
      {/* Axis spokes */}
      {LIFE_AREAS.map((_, i) => {
        const { x, y } = toXY(i, 10)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="0.75" />
      })}
      {/* Filled polygon */}
      <polygon
        points={polygonPoints}
        fill="var(--accent)" fillOpacity="0.12"
        stroke="var(--accent)" strokeWidth="2"
      />
      {/* Data points */}
      {LIFE_AREAS.map((a, i) => {
        const { x, y } = toXY(i, ratings[a.id] || 5)
        return (
          <circle key={i} cx={x} cy={y} r="4.5"
            fill="var(--accent)" stroke="var(--surface)" strokeWidth="1.5"
          />
        )
      })}
      {/* Emoji labels */}
      {LIFE_AREAS.map((a, i) => {
        const { x, y } = labelXY(i)
        return (
          <text key={i} x={x} y={y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="12" fontFamily="system-ui, sans-serif"
          >
            {a.emoji}
          </text>
        )
      })}
    </svg>
  )
}

export default function BalanceWheel({ wheel }) {
  const ratings = wheel.getMonthRatings()
  const avg     = wheel.getAverage()
  const low     = wheel.getLowAreas(5)
  const [editing, setEditing] = useState(false)

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-faint)' }}>
          ⚖️ Life Balance — {format(new Date(), 'MMMM yyyy')}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-forest-500">{avg}/10</span>
          <button
            onClick={() => setEditing(e => !e)}
            className="text-xs font-medium transition-colors px-2.5 py-1 rounded-full border"
            style={editing
              ? { backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }
              : { color: 'var(--text-faint)', borderColor: 'var(--border)' }
            }
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Radar */}
      <RadarChart ratings={ratings} />

      {/* Sliders / bars */}
      <div className="mt-5 space-y-2.5">
        {LIFE_AREAS.map(a => (
          <div key={a.id} className="flex items-center gap-3">
            <span className="text-base w-5 flex-shrink-0 text-center">{a.emoji}</span>
            <span className="text-xs w-24 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              {a.label}
            </span>
            {editing ? (
              <input
                type="range" min="1" max="10" step="1"
                value={ratings[a.id] || 5}
                onChange={e => wheel.setRating(a.id, Number(e.target.value))}
                className="flex-1 accent-forest-500"
              />
            ) : (
              <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${((ratings[a.id] || 5) / 10) * 100}%`, backgroundColor: a.color }}
                />
              </div>
            )}
            <span className="text-xs font-semibold w-4 text-right flex-shrink-0"
              style={{ color: 'var(--text)' }}>
              {ratings[a.id] || 5}
            </span>
          </div>
        ))}
      </div>

      {/* Low area nudge */}
      {low.length > 0 && !editing && (
        <p className="text-xs mt-4 italic" style={{ color: 'var(--text-muted)' }}>
          💡 Consider more attention on: {low.map(a => a.label).join(', ')}
        </p>
      )}
    </div>
  )
}
