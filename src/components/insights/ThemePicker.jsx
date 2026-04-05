// Component: ThemePicker
// Purpose: Lets user choose between Light, Dark, and Forest themes
import Card from '../ui/Card'
import { THEMES } from '../../hooks/useTheme'

export default function ThemePicker({ theme, onSetTheme }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-3">Appearance</p>
      <div className="flex gap-2">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => onSetTheme(t.id)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
              theme === t.id
                ? 'border-forest-500 bg-forest-50 shadow-sm'
                : 'border-stone-200 hover:border-stone-300 bg-white'
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            <span className="text-xs font-medium text-ink">{t.label}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}
