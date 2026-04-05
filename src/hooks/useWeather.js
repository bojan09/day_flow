// Hook: useWeather
// Purpose: Fetch current weather from Open-Meteo (free, no API key needed)
import { useState, useEffect } from 'react'

const WMO_CODES = {
  0: { label: 'Clear',        emoji: '☀️' },
  1: { label: 'Mostly clear', emoji: '🌤️' },
  2: { label: 'Partly cloudy',emoji: '⛅' },
  3: { label: 'Overcast',     emoji: '☁️' },
  45:{ label: 'Foggy',        emoji: '🌫️' },
  48:{ label: 'Foggy',        emoji: '🌫️' },
  51:{ label: 'Light drizzle',emoji: '🌦️' },
  61:{ label: 'Rain',         emoji: '🌧️' },
  71:{ label: 'Snow',         emoji: '❄️' },
  80:{ label: 'Showers',      emoji: '🌧️' },
  95:{ label: 'Thunderstorm', emoji: '⛈️' },
}

export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude: lat, longitude: lon } = coords
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&temperature_unit=celsius&windspeed_unit=kmh`
          const res  = await fetch(url)
          const data = await res.json()
          const code = data.current.weathercode
          setWeather({
            temp:  Math.round(data.current.temperature_2m),
            wind:  Math.round(data.current.windspeed_10m),
            code,
            emoji: WMO_CODES[code]?.emoji || '🌡️',
            label: WMO_CODES[code]?.label || 'Unknown',
          })
        } catch {
          setError('Could not fetch weather')
        } finally {
          setLoading(false)
        }
      },
      () => { setError('Location denied'); setLoading(false) }
    )
  }, [])

  return { weather, loading, error }
}
