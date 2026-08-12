const PRESETS = [25, 45, 60]

export default function FocusControls({ session, duration, customDuration, onDuration, onCustomDuration, onStart, onPause, onContinue, onStop, onComplete }) {
  if (!session) return (
    <div className="space-y-3">
      <fieldset>
        <legend className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Focus duration</legend>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(minutes => <button key={minutes} type="button" aria-pressed={duration === minutes} onClick={() => onDuration(minutes)} className="px-3 py-2 rounded-xl border text-sm" style={{ borderColor: duration === minutes ? 'var(--accent)' : 'var(--border)', color: 'var(--text)' }}>{minutes} min</button>)}
          <button type="button" aria-pressed={duration === 'custom'} onClick={() => onDuration('custom')} className="px-3 py-2 rounded-xl border text-sm" style={{ borderColor: duration === 'custom' ? 'var(--accent)' : 'var(--border)', color: 'var(--text)' }}>Custom</button>
        </div>
      </fieldset>
      {duration === 'custom' && <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>Minutes (1–240)<input type="number" min="1" max="240" step="1" value={customDuration} onChange={event => onCustomDuration(event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' }} /></label>}
      <button type="button" onClick={onStart} className="w-full rounded-xl px-4 py-3 text-white font-semibold" style={{ backgroundColor: 'var(--accent)' }}>Start Focus</button>
    </div>
  )

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {session.status === 'running' ? <button onClick={onPause} className="rounded-xl px-4 py-2 bg-terracotta-500 text-white">Pause</button> : session.status === 'paused' ? <button onClick={onContinue} className="rounded-xl px-4 py-2 text-white" style={{ backgroundColor: 'var(--accent)' }}>Continue</button> : null}
      <button onClick={onStop} className="rounded-xl border px-4 py-2" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Stop</button>
      <button onClick={onComplete} className="rounded-xl px-4 py-2 text-white" style={{ backgroundColor: 'var(--accent)' }}>Complete Task</button>
    </div>
  )
}
