// Component: WidgetCustomizer
// Purpose: Bottom sheet panel for managing Today widgets.
//          Drag to reorder, pin to top, show/hide. Persists via useWidgetPreferences.
import { useState } from 'react'
import Modal from '../ui/Modal'
import { WIDGET_REGISTRY } from '../../hooks/useWidgetPreferences'

export default function WidgetCustomizer({ isOpen, onClose, widgetPrefs, adaptiveOrder }) {
  const [order, setOrder] = useState(() => {
    return widgetPrefs.getOrderedWidgets(adaptiveOrder)
  })
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)

  const getMeta = (id) => WIDGET_REGISTRY.find(w => w.id === id) ?? { id, title: id, emoji: '📦' }

  // ── Drag reorder ────────────────────────────────────────────────────────────
  const onDragStart = (i) => setDragIdx(i)
  const onDragOver  = (e, i) => { e.preventDefault(); setOverIdx(i) }
  const onDrop      = (e, i) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === i) return
    const next = [...order]
    const [item] = next.splice(dragIdx, 1)
    next.splice(i, 0, item)
    setOrder(next)
    setDragIdx(null)
    setOverIdx(null)
  }
  const onDragEnd = () => { setDragIdx(null); setOverIdx(null) }

  // ── Save & reset ────────────────────────────────────────────────────────────
  const handleSave = () => {
    widgetPrefs.setCustomOrder(order)
    onClose()
  }

  const handleReset = () => {
    widgetPrefs.resetOrder()
    setOrder(widgetPrefs.getOrderedWidgets(adaptiveOrder))
  }

  // All widgets including hidden ones (so user can re-enable)
  const allIds = [
    ...order,
    ...WIDGET_REGISTRY.map(w => w.id).filter(id => !order.includes(id)),
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Today" fullScreenOnMobile>
      <div className="space-y-4">

        {/* Instructions */}
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Drag to reorder · 📌 Pin to top · 🙈 Hide · Tap ✦ to show hidden
        </p>

        {/* Core widgets */}
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: 'var(--text-faint)' }}>Core widgets</p>
        <div className="space-y-1.5">
          {allIds.filter(id => !WIDGET_REGISTRY.find(w => w.id === id)?.isModule).map((id, i) => {
            const meta    = getMeta(id)
            const hidden  = widgetPrefs.isHidden(id)
            const pinned  = widgetPrefs.isPinned(id)
            const isDragging = dragIdx === i
            const isOver     = overIdx === i && dragIdx !== i

            return (
              <div
                key={id}
                draggable={!hidden}
                onDragStart={() => onDragStart(i)}
                onDragOver={e => onDragOver(e, i)}
                onDrop={e => onDrop(e, i)}
                onDragEnd={onDragEnd}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all"
                style={{
                  backgroundColor: isOver     ? 'var(--accent-light)'  :
                                   hidden     ? 'var(--bg-secondary)'  : 'var(--surface)',
                  borderColor:     isOver     ? 'var(--accent-mid)'    :
                                   isDragging ? 'var(--accent)'        : 'var(--border)',
                  opacity:         isDragging ? 0.5 : hidden ? 0.5 : 1,
                  cursor:          hidden ? 'default' : 'grab',
                }}
              >
                {/* Drag handle */}
                <span
                  className="text-base flex-shrink-0 select-none"
                  style={{ color: 'var(--text-faint)', cursor: hidden ? 'default' : 'grab' }}
                >
                  {hidden ? '—' : '⠿'}
                </span>

                {/* Emoji + title */}
                <span className="text-base flex-shrink-0">{meta.emoji}</span>
                <span
                  className="flex-1 text-sm font-medium"
                  style={{ color: hidden ? 'var(--text-faint)' : 'var(--text)' }}
                >
                  {meta.title}
                </span>

                {/* Pinned badge */}
                {pinned && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
                  >
                    Pinned
                  </span>
                )}

                {/* Controls */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Pin toggle */}
                  {!hidden && (
                    <button
                      onClick={() => widgetPrefs.togglePin(id)}
                      className="hover-surface w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all"
                      style={{ color: pinned ? 'var(--accent)' : 'var(--text-faint)' }}
                      title={pinned ? 'Unpin' : 'Pin to top'}
                    >
                      {pinned ? '📌' : '📍'}
                    </button>
                  )}

                  {/* Hide/Show toggle */}
                  <button
                    onClick={() => {
                      widgetPrefs.toggleHide(id)
                      if (!hidden) {
                        setOrder(prev => prev.filter(x => x !== id))
                      } else {
                        setOrder(prev => [...prev, id])
                      }
                    }}
                    className="hover-surface w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all"
                    style={{ color: hidden ? 'var(--accent)' : 'var(--text-faint)' }}
                    title={hidden ? 'Show widget' : 'Hide widget'}
                  >
                    {hidden ? '👁' : '🙈'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Module widgets */}
        <p className="text-[10px] font-semibold uppercase tracking-widest mt-5 mb-2"
          style={{ color: 'var(--text-faint)' }}>Dashboard modules</p>
        <p className="text-xs mb-2" style={{ color: 'var(--text-faint)' }}>
          Show full feature previews on Today
        </p>
        <div className="space-y-1.5">
          {allIds.filter(id => WIDGET_REGISTRY.find(w => w.id === id)?.isModule).map((id) => {
            const meta   = getMeta(id)
            const hidden = widgetPrefs.isHidden(id)
            return (
              <div key={id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
                style={{ backgroundColor: hidden ? 'var(--bg-secondary)' : 'var(--surface)', borderColor: 'var(--border)', opacity: hidden ? 0.6 : 1 }}
              >
                <span className="text-base">{meta.emoji}</span>
                <span className="flex-1 text-sm font-medium" style={{ color: hidden ? 'var(--text-faint)' : 'var(--text)' }}>
                  {meta.title}
                </span>
                <button type="button"
                  onClick={() => widgetPrefs.toggleHide(id)}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                  style={hidden
                    ? { backgroundColor: 'var(--accent)', color: 'white' }
                    : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }
                  }>
                  {hidden ? 'Show' : 'Hide'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleReset}
            className="hover-surface px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Reset to default
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Save layout
          </button>
        </div>
      </div>
    </Modal>
  )
}
