// Component: NavCustomizer
// Purpose: Panel to customise mobile bottom nav — replace any of the 4 slots
//          with any module. Persisted to Supabase via useNavConfig.
import Modal       from '../ui/Modal'
import { ALL_MODULES } from '../../hooks/useNavConfig'

export default function NavCustomizer({ isOpen, onClose, navItems, setSlot, resetToDefault }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customise Navigation" fullScreenOnMobile>
      <div className="space-y-4">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Tap any slot to change which module it shows.
        </p>

        {/* 4 slots */}
        {navItems.map((moduleId, slotIdx) => {
          const current = ALL_MODULES.find(m => m.id === moduleId)
          return (
            <div key={slotIdx}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-faint)' }}>
                Slot {slotIdx + 1}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {ALL_MODULES.map(mod => (
                  <button
                    key={mod.id}
                    onClick={() => setSlot(slotIdx, mod.id)}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all active:scale-95"
                    style={moduleId === mod.id
                      ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                      : { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
                    }
                  >
                    <span className="text-lg">{mod.emoji}</span>
                    <span className="text-[9px] font-medium">{mod.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {/* Reset */}
        <button
          onClick={() => { resetToDefault(); onClose() }}
          className="hover-surface w-full py-2.5 rounded-xl border text-sm font-medium transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          Reset to default
        </button>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Save
        </button>
      </div>
    </Modal>
  )
}
