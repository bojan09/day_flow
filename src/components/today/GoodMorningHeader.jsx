// Component: GoodMorningHeader
// Purpose: Personalized time-based greeting, daily quote, weather widget, and daily intention field
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
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
      {/* Top row: greeting + weather */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-ink leading-tight">{greeting} 👋</h2>
          <p className="text-sm text-ink-faint italic mt-0.5 font-serif">"{quote}"</p>
        </div>
        {weather && (
          <div className="flex-shrink-0 flex flex-col items-center bg-parchment rounded-xl px-3 py-2 border border-stone-100">
            <span className="text-2xl">{weather.emoji}</span>
            <span className="text-xs font-semibold text-ink">{weather.temp}°C</span>
            <span className="text-[10px] text-ink-faint">{weather.label}</span>
          </div>
        )}
      </div>

      {/* Daily intention */}
      <div
        className="flex items-center gap-2 bg-forest-50 border border-forest-100 rounded-xl px-4 py-2.5 cursor-text"
        onClick={() => setEditing(true)}
      >
        <span className="text-forest-500 text-sm flex-shrink-0">🎯</span>
        {editing ? (
          <input
            autoFocus
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder-forest-300"
            placeholder="Today I intend to..."
            value={text}
            onChange={e => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={e => e.key === 'Enter' && handleBlur()}
          />
        ) : (
          <span className={`flex-1 text-sm ${text ? 'text-ink font-medium' : 'text-forest-400 italic'}`}>
            {text || 'Today I intend to…  (tap to set)'}
          </span>
        )}
        {text && !editing && (
          <span className="text-xs text-forest-500">✓</span>
        )}
      </div>
    </div>
  )
}
