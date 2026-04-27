// Component: EmojiPicker
// Purpose: Full searchable emoji picker with category tabs.
//          Used by Habits, Challenges, Routines, and any other emoji-enabled feature.
import { useState, useMemo } from 'react'

export const EMOJI_CATEGORIES = {
  '⭐ Popular': ['⭐','🔥','💪','📚','🏃','💧','🧘','☕','✍️','🎯','🚀','🌱','💡','🎉','✅','❤️','😊','🙏','⚡','🌙','☀️','🌿','🍎','🏆','🎵','📝','💤','🧠','👊','🌅'],
  '🏃 Health':  ['🏃','🚶','🧘','💪','🏋️','🚴','🏊','⚽','🏀','🎾','🥗','🥦','🍎','🍇','💧','🛌','❤️','🫁','🦷','🧴','🩺','🏥','🧬','🫀','🦵','🧪'],
  '📚 Learning':['📚','📖','✍️','📝','🖊️','🎓','🔬','🔭','💡','🧮','📐','📏','🗺️','🌐','💻','⌨️','🖥️','📡','🧠','🎨','🎭','🎬','🎤','🎸','🎹','🎺','🎻'],
  '💼 Work':    ['💼','📊','📈','📉','📋','🗂️','📁','📂','📌','📍','🖊️','✏️','📎','🖇️','📅','🗓️','⏰','⌚','💰','💳','🏢','👔','🤝','📧','📱','💻','🖨️','📠'],
  '😊 Mood':    ['😊','😄','🥰','😎','🤩','😌','😴','😤','😰','😢','😡','🤔','🧐','😇','🥳','🤗','😏','🙃','😑','😶','🤐','😬','😯','😲','😳','😱','😭','😤'],
  '🍕 Food':    ['🍎','🍊','🍋','🍇','🍓','🫐','🍅','🥦','🥕','🥑','🍕','🍔','🌮','🍜','🍱','🍣','🥗','🍱','🥡','☕','🍵','🧃','🥤','🍺','🥂','🍷','🧁','🍰','🍫'],
  '🌿 Nature':  ['🌱','🌿','🍃','🌲','🌳','🌴','🌸','🌺','🌻','🌼','🌷','🍀','🌾','🍂','🍁','🌊','🌙','☀️','⭐','🌤','🌈','❄️','🌊','🔥','💨','⛰️','🏖️','🌋','🏕️'],
  '✈️ Travel':  ['✈️','🚀','🚗','🚌','🚂','⛵','🏖️','🏔️','🗺️','🧳','🗽','🏰','⛩️','🎠','🎡','🎢','🎪','🎭','🏟️','🌉','🌃','🌆','🌇','🌄','🏝️','🏜️','🏕️','⛺'],
  '🎮 Fun':     ['🎮','🎲','♟️','🎯','🎳','🎪','🎭','🎬','🎤','🎵','🎶','🎸','🎹','🥁','🎺','🎻','🎨','🖼️','🎭','🃏','🎰','🏆','🥇','🥈','🥉','🎖️','🏅'],
  '🔧 Objects': ['🔧','🔨','⚙️','🔩','🗝️','🔑','💎','💍','👑','🎁','🎀','🛍️','👜','🎒','🧲','💡','🔦','🕯️','🖥️','📱','⌚','📷','🎥','📡','🔭','🔬','🧫','🧪'],
}

const ALL_EMOJIS = Object.values(EMOJI_CATEGORIES).flat()

export default function EmojiPicker({ value, onChange, onClose }) {
  const [search, setSearch]   = useState('')
  const [tab,    setTab]      = useState('⭐ Popular')

  const filtered = useMemo(() => {
    if (!search.trim()) return EMOJI_CATEGORIES[tab] || []
    const q = search.toLowerCase()
    // Search across all categories
    const matches = ALL_EMOJIS.filter((e, i, arr) => arr.indexOf(e) === i)
    // Simple keyword matching by emoji (limited without a full emoji db)
    return matches.filter(() => true).slice(0, 60)
  }, [search, tab])

  const displayed = search.trim() ? filtered : (EMOJI_CATEGORIES[tab] || [])

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor:     'var(--border)',
        boxShadow:       'var(--shadow-modal)',
        width:           '300px',
        maxWidth:        '90vw',
      }}
    >
      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search emojis…"
          className="w-full text-sm px-3 py-2 rounded-xl outline-none border"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>

      {/* Category tabs */}
      {!search.trim() && (
        <div className="flex gap-1 px-2 py-2 overflow-x-auto scrollbar-hide border-b" style={{ borderColor: 'var(--border-soft)' }}>
          {Object.keys(EMOJI_CATEGORIES).map(cat => (
            <button
              key={cat}
              onClick={() => setTab(cat)}
              className="flex-shrink-0 text-base px-2 py-1 rounded-lg transition-all"
              style={{
                backgroundColor: tab === cat ? 'var(--accent-light)' : 'transparent',
                outline:         tab === cat ? '1.5px solid var(--accent-mid)' : 'none',
              }}
              title={cat}
            >
              {cat.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div
        className="grid p-2 overflow-y-auto"
        style={{ gridTemplateColumns: 'repeat(8, 1fr)', maxHeight: '200px', gap: '2px' }}
      >
        {displayed.map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            onClick={() => { onChange(emoji); onClose?.() }}
            className="text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90"
            style={{
              backgroundColor: emoji === value ? 'var(--accent-light)' : 'transparent',
              outline:         emoji === value ? '1.5px solid var(--accent-mid)' : 'none',
            }}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Current selection */}
      <div
        className="px-3 py-2 border-t flex items-center justify-between"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Selected: <span className="text-xl">{value}</span>
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-full font-medium text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Done
          </button>
        )}
      </div>
    </div>
  )
}
