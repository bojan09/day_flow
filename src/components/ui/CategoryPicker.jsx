// Component: CategoryPicker
// Purpose: Reusable category pill-picker with an inline "Add custom" row.
//          Used in TaskForm and TaskDetail. Accepts and shows custom categories.
import { useState } from 'react'
import { DEFAULT_CATEGORIES } from '../../hooks/useCustomCategories'

// Colour map for defaults — custom categories fall back to a neutral style
const DEFAULT_COLORS = {
  Work:     { bg: 'var(--tone-blue-bg)', border: 'var(--tone-blue-border)', text: 'var(--tone-blue-text)' },
  Personal: { bg: 'var(--tone-sage-bg)', border: 'var(--tone-sage-border)', text: 'var(--tone-sage-text)' },
  Health:   { bg: 'var(--tone-emerald-bg)', border: 'var(--tone-emerald-border)', text: 'var(--tone-emerald-text)' },
  Learning: { bg: 'var(--tone-violet-bg)', border: 'var(--tone-violet-border)', text: 'var(--tone-violet-text)' },
  Finance:  { bg: 'var(--tone-amber-bg)', border: 'var(--tone-amber-border)', text: 'var(--tone-amber-text)' },
  Other:    { bg: 'var(--bg-secondary)', border: 'var(--border)', text: 'var(--text-muted)' },
}
const CUSTOM_COLOR = { bg: 'var(--tone-pink-bg)', border: 'var(--tone-pink-border)', text: 'var(--tone-pink-text)' }

function getCategoryStyle(cat, isSelected) {
  const base = DEFAULT_COLORS[cat] || CUSTOM_COLOR
  if (isSelected) {
    return {
      backgroundColor: base.bg,
      borderColor:     base.border,
      color:           base.text,
      fontWeight:      600,
    }
  }
  return {
    backgroundColor: 'transparent',
    borderColor:     'var(--border)',
    color:           'var(--text-muted)',
  }
}

export default function CategoryPicker({ value, onChange, categories, onAddCategory, onRemoveCategory }) {
  const [adding,   setAdding]   = useState(false)
  const [newName,  setNewName]  = useState('')
  const [error,    setError]    = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    const ok = onAddCategory(newName.trim())
    if (ok === false) {
      setError('That category already exists')
      return
    }
    onChange(newName.trim())   // auto-select the new category
    setNewName('')
    setAdding(false)
    setError('')
  }

  const isCustom = (cat) => !DEFAULT_CATEGORIES.includes(cat)

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {categories.map(cat => (
          <div key={cat} className="relative group/cat">
            <button
              type="button"
              onClick={() => onChange(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
              style={getCategoryStyle(cat, value === cat)}
            >
              {cat}
              {/* Bullet indicator for active */}
              {value === cat && (
                <span className="ml-1 text-[8px]">✓</span>
              )}
            </button>

            {/* Remove button — only for custom categories, shown on hover */}
            {isCustom(cat) && onRemoveCategory && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (value === cat) onChange('Other')
                  onRemoveCategory(cat)
                }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] items-center justify-center opacity-0 group-hover/cat:opacity-100 transition-opacity hidden group-hover/cat:flex"
                title="Remove category"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Add category button */}
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="hover-accent-soft px-3 py-1.5 rounded-full text-xs font-medium transition-all border border-dashed"
            style={{ borderColor: 'var(--accent-mid)', color: 'var(--accent-text)' }}
          >
            + Custom
          </button>
        )}
      </div>

      {/* Inline add form */}
      {adding && (
        <div className="flex items-center gap-2 mt-2">
          <input
            autoFocus
            value={newName}
            onChange={e => { setNewName(e.target.value); setError('') }}
            placeholder="Category name…"
            maxLength={24}
            className="input-base flex-1 text-sm py-1.5"
            style={{ backgroundColor: 'var(--bg)', borderColor: error ? '#f87171' : 'var(--border)', color: 'var(--text)' }}
            onKeyDown={e => {
              if (e.key === 'Enter')  { e.preventDefault(); e.stopPropagation(); handleAdd(e) }
              if (e.key === 'Escape') { setAdding(false); setNewName(''); setError('') }
            }}
          />
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); handleAdd(e) }}
            disabled={!newName.trim()}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-white disabled:opacity-40 flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Add
          </button>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); setAdding(false); setNewName(''); setError('') }}
            className="px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0"
            style={{ color: 'var(--text-faint)', border: '1px solid var(--border)' }}
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}
