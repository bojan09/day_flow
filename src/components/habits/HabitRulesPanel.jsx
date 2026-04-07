// Component: HabitRulesPanel
// Purpose: Create "If habit A done → auto-complete habit B" rules
import { useState } from 'react'
import Card from '../ui/Card'

export default function HabitRulesPanel({ habits, habitRules }) {
  const [trigger, setTrigger] = useState('')
  const [action,  setAction]  = useState('')

  const list = habits.habits

  const handleAdd = (e) => {
    e.preventDefault()
    if (!trigger || !action || trigger === action) return
    habitRules.addRule(trigger, action)
    setTrigger('')
    setAction('')
  }

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-3">
        ⚡ Habit Chains (If → Then)
      </p>

      {/* Existing rules */}
      {habitRules.rules.length > 0 && (
        <div className="space-y-2 mb-4">
          {habitRules.rules.map(rule => {
            const trig = list.find(h => h.id === rule.triggerId)
            const act  = list.find(h => h.id === rule.actionId)
            if (!trig || !act) return null
            return (
              <div key={rule.id} className="flex items-center gap-2 group">
                <div className="flex-1 flex items-center gap-2 bg-parchment rounded-xl px-3 py-2 text-sm">
                  <span>{trig.icon}</span>
                  <span className="text-ink-muted">{trig.name}</span>
                  <span className="text-ink-faint text-xs">→</span>
                  <span>{act.icon}</span>
                  <span className="text-ink-muted">{act.name}</span>
                </div>
                <button
                  onClick={() => habitRules.deleteRule(rule.id)}
                  className="text-ink-faint hover:text-red-400 text-xs p-1 opacity-0 group-hover:opacity-100 transition-all"
                >✕</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add rule form */}
      {list.length >= 2 ? (
        <form onSubmit={handleAdd} className="space-y-2">
          <p className="text-xs text-ink-faint mb-1.5">
            When I complete <strong>If</strong> habit, auto-complete <strong>Then</strong> habit:
          </p>
          <div className="flex items-center gap-2">
            <select value={trigger} onChange={e => setTrigger(e.target.value)}
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-stone-200 bg-parchment outline-none focus:ring-2 focus:ring-forest-200 text-ink">
              <option value="">If…</option>
              {list.map(h => (
                <option key={h.id} value={h.id}>{h.icon} {h.name}</option>
              ))}
            </select>
            <span className="text-ink-faint text-sm flex-shrink-0">→</span>
            <select value={action} onChange={e => setAction(e.target.value)}
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-stone-200 bg-parchment outline-none focus:ring-2 focus:ring-forest-200 text-ink">
              <option value="">Then…</option>
              {list.filter(h => h.id !== trigger).map(h => (
                <option key={h.id} value={h.id}>{h.icon} {h.name}</option>
              ))}
            </select>
            <button type="submit" disabled={!trigger || !action}
              className="px-3 py-2 rounded-xl bg-forest-500 text-white text-xs font-medium hover:bg-forest-700 disabled:opacity-40 transition-colors flex-shrink-0">
              Add
            </button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-ink-faint italic">Add at least 2 habits to create chains.</p>
      )}
    </Card>
  )
}
