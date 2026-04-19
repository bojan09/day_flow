// Component: BalanceView
// Purpose: Dedicated Balance tab — life wheel + monthly trend history + focus area guidance.
//          Separated from InsightsView so each tab has a single clear purpose.
import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import BalanceWheel from './BalanceWheel'
import { LIFE_AREAS } from '../../hooks/useBalanceWheel'

// ── Monthly history mini-chart ─────────────────────────────────────────────
function HistoryRow({ monthKey, ratings, isCurrent }) {
  const avg = (Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length).toFixed(1)

  const [year, month] = monthKey.split('-')
  const label = format(new Date(Number(year), Number(month) - 1, 1), 'MMM yyyy')

  return (
    <div
      className="flex items-center gap-3 py-2.5 border-b last:border-0"
      style={{ borderColor: 'var(--border-soft)' }}
    >
      <div className="w-20 flex-shrink-0">
        <p className="text-xs font-medium" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text)' }}>
          {label}
        </p>
        {isCurrent && (
          <span className="text-[10px]" style={{ color: 'var(--accent)' }}>Current</span>
        )}
      </div>

      {/* Mini bar for each life area */}
      <div className="flex-1 flex items-center gap-0.5 h-4">
        {LIFE_AREAS.map(a => (
          <div
            key={a.id}
            className="flex-1 rounded-sm transition-all"
            style={{
              height:          `${((ratings[a.id] || 5) / 10) * 100}%`,
              backgroundColor: a.color,
              opacity:         isCurrent ? 1 : 0.6,
              minHeight:       '2px',
            }}
            title={`${a.label}: ${ratings[a.id] || 5}/10`}
          />
        ))}
      </div>

      <span
        className="text-sm font-semibold w-8 text-right flex-shrink-0"
        style={{ color: isCurrent ? 'var(--accent)' : 'var(--text)' }}
      >
        {avg}
      </span>
    </div>
  )
}

// ── Focus area cards ───────────────────────────────────────────────────────
const AREA_TIPS = {
  health:        'Schedule at least 30 min of movement. Log it in Workouts.',
  career:        'Pick one skill to develop this month. Add it as a goal.',
  relationships: 'Reach out to someone you haven\'t spoken to in a while.',
  finance:       'Review your spending and set one saving intention.',
  fun:           'Block 2 hours this week for something purely enjoyable.',
  growth:        'Read or listen to something new for 15 min daily.',
  environment:   'Declutter one space — even a desk drawer counts.',
  purpose:       'Reflect on why your work matters. Journal about it.',
}

function FocusAreaCard({ area, score }) {
  return (
    <div
      className="flex items-start gap-3 p-3.5 rounded-xl border"
      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">{area.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            {area.label}
          </p>
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            {score}/10
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {AREA_TIPS[area.id] || 'Set a small intention to improve this area.'}
        </p>
      </div>
    </div>
  )
}

// ── Main BalanceView ───────────────────────────────────────────────────────
export default function BalanceView({ wheel }) {
  const history      = wheel.getHistory()       // [[monthKey, ratings], ...]
  const currentMonth = format(new Date(), 'yyyy-MM')
  const currentRatings = wheel.getMonthRatings()
  const lowAreas     = wheel.getLowAreas(5)

  // Sort low areas by score ascending so weakest shows first
  const sortedLow = [...lowAreas].sort(
    (a, b) => (currentRatings[a.id] || 5) - (currentRatings[b.id] || 5)
  )

  const [tab, setTab] = useState('wheel') // 'wheel' | 'history' | 'focus'

  const TABS = [
    { id: 'wheel',   label: '⚖️ Wheel'   },
    { id: 'history', label: '📈 History' },
    { id: 'focus',   label: '🎯 Focus'   },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">

      {/* Intro */}
      <div>
        <h2 className="font-serif text-xl" style={{ color: 'var(--text)' }}>
          Life Balance
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Rate 8 key life areas monthly. Spot imbalances before they grow.
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="rounded-2xl border p-4 text-center"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>
            Avg score
          </p>
          <p className="font-serif text-2xl" style={{ color: 'var(--accent)' }}>
            {wheel.getAverage()}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>out of 10</p>
        </div>
        <div
          className="rounded-2xl border p-4 text-center"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>
            Months tracked
          </p>
          <p className="font-serif text-2xl" style={{ color: 'var(--text)' }}>
            {history.length}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>recorded</p>
        </div>
        <div
          className="rounded-2xl border p-4 text-center"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>
            Low areas
          </p>
          <p className="font-serif text-2xl" style={{ color: lowAreas.length > 0 ? '#C4622D' : 'var(--accent)' }}>
            {lowAreas.length}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>below 5</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div
        className="flex gap-0.5 rounded-xl p-0.5"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={tab === t.id
              ? { backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)', color: 'var(--text)' }
              : { color: 'var(--text-faint)' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Wheel tab */}
      {tab === 'wheel' && <BalanceWheel wheel={wheel} />}

      {/* History tab */}
      {tab === 'history' && (
        <div
          className="rounded-2xl border p-5"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            {LIFE_AREAS.map(a => (
              <div key={a.id} className="flex items-center gap-1 flex-shrink-0">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{a.label}</span>
              </div>
            ))}
          </div>

          {history.length === 0 ? (
            <p className="text-sm italic text-center py-6" style={{ color: 'var(--text-faint)' }}>
              Rate your life areas each month to see trends here.
            </p>
          ) : (
            <div>
              {history.map(([monthKey, ratings]) => (
                <HistoryRow
                  key={monthKey}
                  monthKey={monthKey}
                  ratings={ratings}
                  isCurrent={monthKey === currentMonth}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Focus tab */}
      {tab === 'focus' && (
        <div className="space-y-3">
          {sortedLow.length === 0 ? (
            <div
              className="rounded-2xl border p-8 text-center"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-3xl mb-3">🎉</p>
              <p className="font-serif text-lg mb-1" style={{ color: 'var(--text)' }}>
                All areas above 5
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Strong balance this month. Keep it up!
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                These areas scored below 5 this month. Small consistent actions move the needle.
              </p>
              {sortedLow.map(area => (
                <FocusAreaCard
                  key={area.id}
                  area={area}
                  score={currentRatings[area.id] || 5}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
