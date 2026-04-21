// Component: ChallengesView
// Purpose: Time-boxed micro-habit challenges with daily check-ins and progress rings
import { useState } from 'react'
import Card  from '../ui/Card'
import Modal from '../ui/Modal'
import EmptyState from '../ui/EmptyState'
import { CHALLENGE_PRESETS } from '../../hooks/useChallenges'
import { getTodayKey } from '../../utils/dateUtils'
import { format, addDays, parseISO } from 'date-fns'

function ChallengeCard({ c, challenges, onEdit }) {
  const daysLeft    = challenges.getDaysLeft(c)
  const daysElapsed = challenges.getDaysElapsed(c)
  const completed   = challenges.getCompletedDays(c)
  const progress    = challenges.getProgress(c)
  const doneTodaay  = challenges.isDayDone(c.id)
  const expired     = daysLeft === 0

  const R    = 28
  const circ = 2 * Math.PI * R
  const dash = (progress / 100) * circ

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 ${expired ? 'opacity-60 border-stone-100' : 'border-stone-100'}`}>
      <div className="flex items-center gap-3">
        {/* Mini ring */}
        <div className="relative flex-shrink-0">
          <svg width="68" height="68" viewBox="0 0 68 68" className="-rotate-90">
            <circle cx="34" cy="34" r={R} fill="none" stroke="#F1EDE8" strokeWidth="5" />
            <circle cx="34" cy="34" r={R} fill="none"
              stroke={expired ? '#A7C9A0' : '#3B6B4B'} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={`${dash} ${circ - dash}`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl">{c.emoji}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink">{c.title}</p>
          <p className="text-xs text-ink-faint mt-0.5">
            {expired ? `Finished — ${completed}/${c.days} days done` : `${daysLeft} days left · ${completed}/${daysElapsed} done`}
          </p>
          <div className="mt-1.5 h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-forest-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {!expired && (
            <button
              onClick={() => challenges.toggleDay(c.id)}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all ${
                doneTodaay ? 'bg-forest-500 border-forest-500 text-white' : 'border-stone-300 hover:border-forest-400'
              }`}
            >{doneTodaay ? '✓' : ''}</button>
          )}
          <div className="flex flex-col gap-1.5">
            <button onClick={() => onEdit?.(c)}
              className="text-xs w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-faint)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Edit">✏️</button>
            <button onClick={() => challenges.deleteChallenge(c.id)}
              className="text-xs w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-faint)' }}
              onMouseOver={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
              onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}>✕</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChallengesView({ challenges }) {
  const [modal,   setModal]   = useState(false)  // 'add' | 'edit'
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({ title: '', emoji: '🎯', days: 7 })
  const [tab,     setTab]     = useState('active')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    if (modal === 'edit' && editing) {
      challenges.updateChallenge(editing.id, { title: form.title, emoji: form.emoji, days: form.days })
    } else {
      challenges.startChallenge(form)
    }
    setForm({ title: '', emoji: '🎯', days: 7 })
    setModal(false); setEditing(null)
  }

  const usePreset = (preset) => {
    challenges.startChallenge(preset)
  }

  const list = tab === 'active' ? challenges.active : challenges.archived

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex bg-stone-100 rounded-full p-0.5">
          {['active','archived'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${tab === t ? 'bg-white shadow-sm text-ink' : 'text-ink-muted'}`}>
              {t} {t === 'active' ? `(${challenges.active.length})` : ''}
            </button>
          ))}
        </div>
        <button onClick={() => { setEditing(null); setModal('add') }}
          className="px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 transition-colors">
          + Challenge
        </button>
      </div>

      {/* Preset suggestions */}
      {tab === 'active' && challenges.active.length === 0 && (
        <div>
          <p className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">Quick start</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CHALLENGE_PRESETS.map(p => (
              <button key={p.title} onClick={() => usePreset(p)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 text-sm text-ink hover:border-forest-300 hover:bg-forest-50 transition-all flex-shrink-0">
                <span>{p.emoji}</span>
                <span className="whitespace-nowrap">{p.title}</span>
                <span className="text-[10px] text-ink-faint">{p.days}d</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState type="default" title="No challenges"
          subtitle={tab === 'active' ? "Start a challenge and show up every day." : "Completed challenges will appear here."}
          action={tab === 'active' ? "Start a challenge" : undefined}
          onAction={tab === 'active' ? () => setModal(true) : undefined} />
      ) : (
        <div className="space-y-3">
          {list.map(c => <ChallengeCard key={c.id} c={c} challenges={challenges} onEdit={c => { setEditing(c); setModal('edit'); setForm({ title: c.title, emoji: c.emoji, days: c.days }) }} />)}
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => { setModal(false); setEditing(null) }} title={modal === 'edit' ? 'Edit Challenge' : 'New Challenge'}>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1.5">Challenge title</label>
            <input autoFocus value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. No social media"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-parchment text-sm text-ink outline-none focus:ring-2 focus:ring-forest-200" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Duration</p>
            <div className="grid grid-cols-4 gap-2">
              {[7, 14, 21, 30].map(d => (
                <button key={d} type="button" onClick={() => setForm(p => ({ ...p, days: d }))}
                  className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                    form.days === d ? 'bg-forest-500 text-white border-forest-500' : 'border-stone-200 text-ink-muted hover:bg-stone-50'
                  }`}>{d}d</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-ink-muted hover:bg-stone-50">Cancel</button>
            <button type="submit" disabled={!form.title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 disabled:opacity-40">Start</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
