// Component: GoodMorningHeader
// Purpose: Polished greeting card with weather, quote, and daily intention — fully theme-aware
import { useState } from 'react'
import { getGreeting, getDailyQuote } from '../../utils/greetings'
import { useWeather } from '../../hooks/useWeather'

export default function GoodMorningHeader({ intention }) {
  const greeting = getGreeting()
  const quote    = getDailyQuote()
  const { weather } = useWeather()
  const [text,    setText]    = useState(intention.getTodayIntention())
  const [editing, setEditing] = useState(false)

  const handleBlur = () => {
    intention.setTodayIntention(text)
    setEditing(false)
  }

  return (
    <div
      className="rounded-2xl border p-5 space-y-3 animate-fade-up"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-2xl leading-tight" style={{ color: 'var(--text)' }}>
            {greeting} 👋
          </h2>
          <p className="text-sm mt-1 leading-relaxed italic font-serif" style={{ color: 'var(--text-muted)' }}>
            "{quote}"
          </p>
        </div>
        {weather && (
          <div
            className="flex-shrink-0 flex flex-col items-center rounded-xl px-3 py-2 border text-center"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <span className="text-2xl">{weather.emoji}</span>
            <span className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{weather.temp}°C</span>
            <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{weather.label}</span>
          </div>
        )}
      </div>

      {/* Daily intention */}
      <div
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 cursor-text border transition-all"
        style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)' }}
        onClick={() => setEditing(true)}
      >
        <span className="text-sm flex-shrink-0 text-forest-500">🎯</span>
        {editing ? (
          <input
            autoFocus
            className="flex-1 bg-transparent text-sm outline-none placeholder-forest-300/60"
            style={{ color: 'var(--text)' }}
            placeholder="Today I intend to…"
            value={text}
            onChange={e => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={e => e.key === 'Enter' && handleBlur()}
          />
        ) : (
          <span className={`flex-1 text-sm ${text ? 'font-medium' : 'italic'}`}
            style={{ color: text ? 'var(--text)' : 'var(--accent)' }}>
            {text || 'Today I intend to…  (tap to set)'}
          </span>
        )}
        {text && !editing && <span className="text-xs text-forest-500">✓</span>}
      </div>
    </div>
  )
}
