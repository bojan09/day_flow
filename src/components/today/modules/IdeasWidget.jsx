// Component: IdeasWidget
// Purpose: Mini Today dashboard card — recent ideas with quick-capture link.
import { memo } from 'react'

function IdeasWidget({ ideas, onTabChange }) {
  const recent = [...(ideas?.ideas || [])]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 4)

  return (
    <div className="space-y-1 px-4 pb-3">
      {recent.length === 0 ? (
        <p className="text-sm italic text-center py-2" style={{ color: 'var(--text-faint)' }}>
          No ideas captured yet
        </p>
      ) : (
        recent.map(i => (
          <button type="button" key={i.id}
            onClick={() => onTabChange?.('ideas')}
            className="w-full flex items-center gap-2.5 py-1.5 text-left rounded-xl transition-colors"
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span className="text-base">💡</span>
            <span className="text-sm font-medium truncate flex-1" style={{ color: 'var(--text)' }}>
              {i.title}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
              {i.category || 'Idea'}
            </span>
          </button>
        ))
      )}
      <button type="button" onClick={() => onTabChange?.('ideas')}
        className="text-xs font-medium pt-1" style={{ color: 'var(--accent)' }}>
        View all ideas →
      </button>
    </div>
  )
}

export default memo(IdeasWidget)
