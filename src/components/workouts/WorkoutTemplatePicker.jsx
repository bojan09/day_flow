// Component: WorkoutTemplatePicker
// Purpose: First screen of the log-workout modal — pick a recent/recurring
//          session to repeat (pre-fills the form), or start blank.
//          `recentSessions` = last N distinct-by-type sessions, newest first,
//          computed by the caller from `sessions`.
export default function WorkoutTemplatePicker({ recentSessions, onPick, onBlank }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium px-1" style={{ color: 'var(--text)' }}>Start from...</p>
      {recentSessions.map(s => (
        <button key={s.id} onClick={() => onPick(s)}
          className="w-full text-left rounded-xl p-3 text-sm"
          style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
          {s.type} <span style={{ color: 'var(--text-faint)' }}>· last: {s.date}</span>
        </button>
      ))}
      <button onClick={onBlank}
        className="w-full text-left rounded-xl p-3 text-sm"
        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
        + Blank session
      </button>
    </div>
  )
}
