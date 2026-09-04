// Component: BottomNav
// Purpose: Mobile bottom navigation — 4 customisable slots + More drawer trigger.
//          Long-press any tab (or tap ⚙️) to open NavCustomizer.
import { useState } from 'react'
import { useNavConfig } from '../../hooks/useNavConfig'
import NavCustomizer   from './NavCustomizer'

export default function BottomNav({ activeTab, onTabChange, onOpenDrawer }) {
  const { navItems, setSlot, resetToDefault, getModule } = useNavConfig()
  const [showCustomizer, setShowCustomizer] = useState(false)

  const isMoreActive = !navItems.includes(activeTab)

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[var(--z-nav)] border-t pb-safe"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="grid" style={{ gridTemplateColumns: `repeat(${navItems.length + 1}, 1fr)` }}>
          {navItems.map((moduleId, i) => {
            const mod    = getModule(moduleId)
            const active = activeTab === moduleId
            return (
              <button
                key={i}
                onClick={() => onTabChange(moduleId)}
                className="flex flex-col items-center justify-center gap-0.5 min-w-0 py-2 min-h-[56px] relative transition-all active:scale-95"
                style={{ color: active ? 'var(--accent-text)' : 'var(--text-faint)' }}
                aria-label={mod.label}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                )}
                <span
                  className="leading-none transition-transform duration-150"
                  style={{ transform: active ? 'scale(1.15)' : 'scale(1)' }}
                >
                  <mod.Icon size={21} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                </span>
                <span className="text-[10px] font-medium tracking-tight w-full text-center truncate px-0.5"
                  style={{ fontWeight: active ? 600 : 400 }}>
                  {mod.label}
                </span>
              </button>
            )
          })}

          {/* More button */}
          <button
            onClick={onOpenDrawer}
            className="flex flex-col items-center justify-center gap-0.5 min-w-0 py-2 min-h-[56px] relative transition-all active:scale-95"
            style={{ color: isMoreActive ? 'var(--accent-text)' : 'var(--text-faint)' }}
            aria-label="More navigation options"
          >
            {isMoreActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full"
                style={{ backgroundColor: 'var(--accent)' }}
              />
            )}
            <span className="grid grid-cols-2 gap-[3px] w-5 h-5 transition-transform duration-150"
              style={{ transform: isMoreActive ? 'scale(1.15)' : 'scale(1)' }}>
              {[0,1,2,3].map(i => (
                <span key={i} className="rounded-[2px]"
                  style={{ backgroundColor: isMoreActive ? 'var(--accent)' : 'var(--text-faint)' }} />
              ))}
            </span>
            <span className="text-[10px] tracking-tight w-full text-center truncate px-0.5" style={{ fontWeight: isMoreActive ? 600 : 400 }}>
              More
            </span>
          </button>
        </div>

        {/* Customize hint */}
        <button
          onClick={() => setShowCustomizer(true)}
          className="tap-target absolute -top-7 right-3 text-[10px] px-2 py-1 rounded-full border transition-all"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor:     'var(--border)',
            color:           'var(--text-faint)',
          }}
        >
          ✦ customise nav
        </button>
      </nav>

      <NavCustomizer
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        navItems={navItems}
        setSlot={setSlot}
        resetToDefault={resetToDefault}
      />
    </>
  )
}
