// Component: GoodMorningHeader
// Purpose: Polished greeting card — gradient accent band, intention input, weather.
//          v6.2: gradient top band, richer typography, card-hover elevation.
import { memo, useState } from 'react'
import { getGreeting, getDailyQuote } from '../../utils/greetings'
import { useWeather } from '../../hooks/useWeather'

function GoodMorningHeader({ intention }) {
  const greeting = getGreeting()
  const quote    = getDailyQuote()
  const { weather } = useWeather()
  const [text,    setText]    = useState(intention.getTodayIntention())
  const [editing, setEditing] = useState(false)

  const handleBlur = () => { intention.setTodayIntention(text); setEditing(false) }

  return (
    <div
      className="rounded-2xl border overflow-hidden card-hover animate-fade-up"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Gradient top band */}
      <div
        className="px-5 pt-5 pb-4"
        style={{
          background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--surface) 60%)',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2
              className="font-serif leading-tight"
              style={{ color: 'var(--text)', fontSize: 'var(--text-xl)' }}
            >
              {greeting} 👋
            </h2>
            <p
              className="mt-1.5 leading-relaxed italic font-serif"
              style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}
            >
              "{quote}"
            </p>
          </div>

          {/* Weather widget */}
          {weather && (
            <div
              className="flex-shrink-0 flex flex-col items-center rounded-2xl px-3.5 py-2.5 text-center border card-hover"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <span className="text-2xl">{weather.emoji}</span>
              <span className="text-sm font-bold mt-0.5" style={{ color: 'var(--text)' }}>
                {weather.temp}°C
              </span>
              <span style={{ color: 'var(--text-faint)', fontSize: 'var(--text-2xs)' }}>
                {weather.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Intention input */}
      <div className="px-5 py-3.5">
        <p style={{ color: 'var(--text-faint)', fontSize: 'var(--text-2xs)' }}
          className="uppercase tracking-wider font-semibold mb-2">
          Today's intention
        </p>
        {editing ? (
          <input
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={e => e.key === 'Enter' && handleBlur()}
            placeholder="What matters most today?"
            className="input-base w-full"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="hover-accent-soft w-full text-left transition-colors rounded-xl px-4 py-2.5 border"
            style={{
              color:           text ? 'var(--text)' : 'var(--text-faint)',
              borderColor:     'var(--border)',
              backgroundColor: 'var(--bg)',
              fontStyle:       text ? 'normal' : 'italic',
              fontSize:        'var(--text-sm)',
            }}
          >
            {text || 'Set your intention for today…'}
            {text && (
              <span className="ml-2" style={{ color: 'var(--accent-text)', fontSize: 'var(--text-2xs)' }}>
                ✓
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default memo(GoodMorningHeader)
