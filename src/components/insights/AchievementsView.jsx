// Component: AchievementsView
// Purpose: Full achievements tab — category progress rings, unlocked/locked grid,
//          XP level progression bar.
import { useEffect } from 'react'

function LevelBar({ xp }) {
  const info = xp.getLevelInfo()
  if (!info) return null
  // getLevelInfo spreads current level fields directly: { level, title, min, next, progress, totalXP }
  const { level, title, next, progress, totalXP } = info

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-serif text-lg" style={{ color: 'var(--text)' }}>{title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>Level {level} · {totalXP} XP</p>
        </div>
        {next && (
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Next</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{next.title}</p>
          </div>
        )}
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }}
        />
      </div>
      {next && (
        <p className="text-[11px] mt-1.5 text-right" style={{ color: 'var(--text-faint)' }}>
          {next.min - totalXP} XP to {next.title}
        </p>
      )}
    </div>
  )
}

function CategoryProgress({ label, total, unlocked }) {
  const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0
  const R   = 18
  const circ = 2 * Math.PI * R
  const dash = (pct / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-12 h-12">
        <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
          <circle cx="24" cy="24" r={R} fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle cx="24" cy="24" r={R} fill="none" stroke="var(--accent)" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>{pct}%</span>
        </div>
      </div>
      <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{unlocked}/{total}</p>
    </div>
  )
}

function AchievementBadge({ achievement, isUnlocked, unlockedAt }) {
  return (
    <div
      className="rounded-xl border p-3 flex flex-col items-center gap-1.5 text-center transition-all"
      style={{
        backgroundColor: isUnlocked ? 'var(--accent-light)' : 'var(--bg-secondary)',
        borderColor:     isUnlocked ? 'var(--accent-mid)'   : 'var(--border)',
        opacity:         isUnlocked ? 1 : 0.5,
      }}
      title={achievement.desc}
    >
      <span className={`text-2xl ${isUnlocked ? '' : 'grayscale opacity-40'}`}>
        {achievement.icon}
      </span>
      <p className="text-[11px] font-semibold leading-tight" style={{ color: 'var(--text)' }}>
        {achievement.title}
      </p>
      <p className="text-[9px] leading-tight" style={{ color: 'var(--text-faint)' }}>
        {isUnlocked
          ? new Date(unlockedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })
          : achievement.desc
        }
      </p>
    </div>
  )
}

export default function AchievementsView({ achievements, xp }) {
  // Check for newly unlocked on mount
  useEffect(() => { achievements.checkAchievements() }, [])

  const categories = Object.entries(achievements.byCategory)

  return (
    <div className="max-w-2xl mx-auto space-y-5 pt-2">
      {/* Header stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl" style={{ color: 'var(--text)' }}>Achievements</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {achievements.totalUnlocked} of {achievements.totalPossible} unlocked
          </p>
        </div>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center border-2"
          style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--accent-light)' }}
        >
          <span className="font-serif text-lg font-bold" style={{ color: 'var(--accent)' }}>
            {Math.round((achievements.totalUnlocked / achievements.totalPossible) * 100)}%
          </span>
        </div>
      </div>

      {/* XP level bar */}
      <LevelBar xp={xp} />

      {/* Category progress rings */}
      <div
        className="rounded-2xl border p-5"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
          By category
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {categories.map(([label, { total, unlocked }]) => (
            <CategoryProgress key={label} label={label} total={total} unlocked={unlocked} />
          ))}
        </div>
      </div>

      {/* Recently unlocked */}
      {achievements.unlockedList.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--text-faint)' }}>
            ✨ Unlocked
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {achievements.unlockedList.map(a => (
              <AchievementBadge key={a.id} achievement={a} isUnlocked unlockedAt={a.unlockedAt} />
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {achievements.lockedList.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--text-faint)' }}>
            🔒 Locked
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {achievements.lockedList.map(a => (
              <AchievementBadge key={a.id} achievement={a} isUnlocked={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
