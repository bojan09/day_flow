// Component: BalanceWheel
// Purpose: Life balance wheel — radar chart for 8 life areas, monthly rating, trend history
import { useState } from 'react'
import Card from '../ui/Card'
import { LIFE_AREAS } from '../../hooks/useBalanceWheel'
import { format } from 'date-fns'

function RadarChart({ ratings, size = 220 }) {
  const n      = LIFE_AREAS.length
  const cx     = size / 2
  const cy     = size / 2
  const maxR   = size / 2 - 24
  const levels = [2, 4, 6, 8, 10]

  const angleStep = (2 * Math.PI) / n
  const startAngle = -Math.PI / 2

  const toXY = (i, val) => {
    const angle = startAngle + i * angleStep
    const r     = (val / 10) * maxR
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  const labelXY = (i) => {
    const angle = startAngle + i * angleStep
    const r     = maxR + 16
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  const polygonPoints = LIFE_AREAS.map((a, i) => {
    const val = ratings[a.id] || 5
    const { x, y } = toXY(i, val)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Grid circles */}
      {levels.map(l => (
        <circle key={l} cx={cx} cy={cy} r={(l / 10) * maxR}
          fill="none" stroke="#E8E5E0" strokeWidth="0.5" />
      ))}

      {/* Axis lines */}
      {LIFE_AREAS.map((_, i) => {
        const { x, y } = toXY(i, 10)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E8E5E0" strokeWidth="0.5" />
      })}

      {/* Polygon */}
      <polygon points={polygonPoints} fill="#3B6B4B" fillOpacity="0.15" stroke="#3B6B4B" strokeWidth="2" />

      {/* Data points */}
      {LIFE_AREAS.map((a, i) => {
        const val      = ratings[a.id] || 5
        const { x, y } = toXY(i, val)
        return <circle key={i} cx={x} cy={y} r="4" fill="#3B6B4B" />
      })}

      {/* Labels */}
      {LIFE_AREAS.map((a, i) => {
        const { x, y } = labelXY(i)
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="#737373" fontFamily="Outfit, sans-serif">
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
    <Card>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
          ⚖️ Life Balance — {format(new Date(), 'MMMM')}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-forest-500">{avg}/10</span>
          <button onClick={() => setEditing(e => !e)}
            className="text-xs text-ink-faint hover:text-ink transition-colors">
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      <RadarChart ratings={ratings} />

      {/* Area labels & sliders */}
      <div className="mt-4 space-y-2">
        {LIFE_AREAS.map(a => (
          <div key={a.id} className="flex items-center gap-3">
            <span className="text-base w-6 text-center flex-shrink-0">{a.emoji}</span>
            <span className="text-xs text-ink-muted w-24 flex-shrink-0">{a.label}</span>
            {editing ? (
              <input type="range" min="1" max="10" step="1"
                value={ratings[a.id] || 5}
                onChange={e => wheel.setRating(a.id, Number(e.target.value))}
                className="flex-1 accent-forest-500" />
            ) : (
              <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${((ratings[a.id] || 5) / 10) * 100}%`, backgroundColor: a.color }} />
              </div>
            )}
            <span className="text-xs font-medium text-ink w-4 text-right flex-shrink-0">{ratings[a.id] || 5}</span>
          </div>
        ))}
      </div>

      {low.length > 0 && !editing && (
        <p className="text-xs text-ink-muted mt-3 italic">
          💡 Consider giving more attention to: {low.map(a => a.label).join(', ')}
        </p>
      )}
    </Card>
  )
}
