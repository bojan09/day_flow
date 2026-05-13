// Component: EmojiPicker
// Purpose: Searchable emoji picker with category tabs.
//          v6.3 fix: search now works via keyword map; category switching is instant.
import { useState, useMemo } from 'react'

export const EMOJI_CATEGORIES = {
  '⭐ Popular':  ['⭐','🔥','💪','📚','🏃','💧','🧘','☕','✍️','🎯','🚀','🌱','💡','🎉','✅','❤️','😊','🙏','⚡','🌙','☀️','🌿','🍎','🏆','🎵','📝','💤','🧠','👊','🌅'],
  '🏃 Health':  ['🏃','🚶','🧘','💪','🏋️','🚴','🏊','⚽','🏀','🎾','🥗','🥦','🍎','🍇','💧','🛌','❤️','🦷','🧴','🩺','🏥','🦵','🧬','🫀','🫁'],
  '📚 Learn':   ['📚','📖','✍️','📝','🖊️','🎓','🔬','🔭','💡','🧮','📐','📏','🗺️','🌐','💻','⌨️','🖥️','📡','🧠','🎨','🎭','🎬','🎤'],
  '💼 Work':    ['💼','📊','📈','📉','📋','🗂️','📁','📂','📌','📍','🖊️','✏️','📎','📅','🗓️','⏰','⌚','💰','💳','🏢','👔','🤝','📧','📱','💻'],
  '😊 Mood':    ['😊','😄','🥰','😎','🤩','😌','😴','😤','😰','😢','😡','🤔','🧐','😇','🥳','🤗','😏','🙃','😑','😶','🤐','😬','😯','😲','😳','😱','😭'],
  '🍕 Food':    ['🍎','🍊','🍋','🍇','🍓','🫐','🍅','🥦','🥕','🥑','🍕','🍔','🌮','🍜','🍱','🍣','🥗','☕','🍵','🧃','🥤','🧁','🍰','🍫'],
  '🌿 Nature':  ['🌱','🌿','🍃','🌲','🌳','🌴','🌸','🌺','🌻','🌼','🌷','🍀','🌾','🍂','🍁','🌊','🌙','☀️','⭐','🌤','🌈','❄️','🔥','💨','⛰️','🏖️'],
  '✈️ Travel':  ['✈️','🚀','🚗','🚌','🚂','⛵','🏖️','🏔️','🗺️','🧳','🗽','🏰','⛩️','🎠','🎡','🎢','🏟️','🌉','🌃','🌆','🌇','🌄','🏝️'],
  '🎮 Fun':     ['🎮','🎲','♟️','🎯','🎳','🎪','🎭','🎬','🎤','🎵','🎶','🎸','🎹','🥁','🎺','🎻','🎨','🖼️','🏆','🥇','🥈','🥉','🎖️','🏅'],
  '🔧 Objects': ['🔧','🔨','⚙️','🔩','🗝️','🔑','💎','💍','👑','🎁','🎀','🛍️','💡','🔦','🕯️','🖥️','📱','⌚','📷','🎥','📡','🔭','🔬'],
}

// Keyword → emoji mapping for search
const KEYWORD_MAP = {
  run: '🏃', running: '🏃', jog: '🏃', walk: '🚶', gym: '🏋️', workout: '💪',
  strong: '💪', muscle: '💪', lift: '🏋️', swim: '🏊', bike: '🚴', yoga: '🧘',
  meditate: '🧘', water: '💧', drink: '💧', sleep: '🛌', bed: '🛌', rest: '💤',
  heart: '❤️', health: '🩺', book: '📚', read: '📖', study: '🎓', learn: '💡',
  write: '✍️', note: '📝', pen: '🖊️', pencil: '✏️', code: '💻', work: '💼',
  job: '💼', money: '💰', cash: '💰', star: '⭐', fire: '🔥', goal: '🎯',
  target: '🎯', rocket: '🚀', plant: '🌱', grow: '🌱', idea: '💡', brain: '🧠',
  think: '🧠', happy: '😊', smile: '😊', love: '🥰', cool: '😎', sad: '😢',
  angry: '😡', sleep: '😴', coffee: '☕', food: '🍎', fruit: '🍎', eat: '🍕',
  cook: '🍳', music: '🎵', song: '🎵', art: '🎨', paint: '🎨', game: '🎮',
  play: '🎮', travel: '✈️', car: '🚗', sun: '☀️', moon: '🌙', rain: '🌧️',
  tree: '🌲', flower: '🌸', sport: '⚽', ball: '⚽', win: '🏆', award: '🏆',
  trophy: '🏆', medal: '🥇', check: '✅', done: '✅', calendar: '📅', time: '⏰',
  clock: '⏰', phone: '📱', laptop: '💻', camera: '📷', photo: '📷', key: '🔑',
  home: '🏠', house: '🏠', chart: '📊', graph: '📈', meeting: '🤝',
}

const ALL_EMOJIS_FLAT = [...new Set(Object.values(EMOJI_CATEGORIES).flat())]

function searchEmojis(query) {
  if (!query.trim()) return []
  const q = query.toLowerCase().trim()

  // 1. Direct keyword matches
  const keywordMatches = Object.entries(KEYWORD_MAP)
    .filter(([kw]) => kw.includes(q))
    .map(([, emoji]) => emoji)

  // 2. Scan all categories for emojis near matching keywords
  // Fall back: return emojis from the category whose name matches
  const catMatches = Object.entries(EMOJI_CATEGORIES)
    .filter(([catName]) => catName.toLowerCase().includes(q))
    .flatMap(([, emojis]) => emojis.slice(0, 8))

  // Combine, deduplicate, limit
  const combined = [...new Set([...keywordMatches, ...catMatches])]
  return combined.length > 0 ? combined : ALL_EMOJIS_FLAT.slice(0, 30)
}

export default function EmojiPicker({ value, onChange, onClose }) {
  const [search, setSearch] = useState('')
  const [tab,    setTab]    = useState('⭐ Popular')

  const displayed = useMemo(() => {
    if (search.trim()) return searchEmojis(search)
    return EMOJI_CATEGORIES[tab] || EMOJI_CATEGORIES['⭐ Popular']
  }, [search, tab])

  const handleTabChange = (cat) => {
    setTab(cat)
    setSearch('')   // clear search when switching tabs
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor:     'var(--border)',
        boxShadow:       'var(--shadow-modal)',
        width:           '300px',
        maxWidth:        '92vw',
      }}
    >
      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search emojis… (run, heart, work…)"
          className="w-full text-sm px-3 py-2 rounded-xl outline-none border"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>

      {/* Category tabs — hidden while searching */}
      {!search.trim() && (
        <div
          className="flex gap-0.5 px-2 py-2 overflow-x-auto scrollbar-hide border-b"
          style={{ borderColor: 'var(--border-soft)' }}
        >
          {Object.keys(EMOJI_CATEGORIES).map(cat => {
            const active = tab === cat
            return (
              <button
                key={cat}
                onClick={() => handleTabChange(cat)}
                className="flex-shrink-0 text-lg w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  backgroundColor: active ? 'var(--accent-light)' : 'transparent',
                  outline:         active ? '1.5px solid var(--accent-mid)' : 'none',
                }}
                title={cat}
              >
                {cat.split(' ')[0]}
              </button>
            )
          })}
        </div>
      )}

      {/* Search label */}
      {search.trim() && (
        <div className="px-3 pt-2 pb-1">
          <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
            Results for "{search}" · tap to clear ✕
          </p>
        </div>
      )}

      {/* Emoji grid */}
      <div
        className="grid p-2 overflow-y-auto"
        style={{ gridTemplateColumns: 'repeat(8, 1fr)', maxHeight: '190px', gap: '2px' }}
      >
        {displayed.length === 0 ? (
          <div className="col-span-8 text-center py-4">
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              No results — try another keyword
            </p>
          </div>
        ) : displayed.map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            onClick={() => { onChange(emoji); onClose?.() }}
            className="text-xl w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 hover:scale-110"
            style={{
              backgroundColor: emoji === value ? 'var(--accent-light)' : 'transparent',
              outline:         emoji === value ? '1.5px solid var(--accent-mid)' : 'none',
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Footer — current selection + done */}
      <div
        className="px-3 py-2.5 border-t flex items-center justify-between"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{value}</span>
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>selected</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Done
          </button>
        )}
      </div>
    </div>
  )
}
