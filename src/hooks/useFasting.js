// Hook: useFasting
// Purpose: Fasting plan, the running fast, and history.
//
// Storage follows the app's existing KV pattern (usePersistedState ->
// user_data), same as mood/intention/reflections, so there is no migration and
// the offline queue and localStorage fallback come for free.
//
// The running fast is stored as timestamps only. Nothing counts up in memory,
// so closing the app, refreshing or sleeping the device cannot drift it.
import { useEffect, useState } from 'react'
import { usePersistedState } from './usePersistedState'
import { getTodayKey } from '../utils/dateUtils'
import {
  makePlan, startFast, fastProgress, completeFast, fastingStats,
} from '../services/fastingModel'

export function useFasting() {
  const [plan, setPlan]       = usePersistedState('fasting_plan', null)
  const [active, setActive]   = usePersistedState('fasting_active', null)
  const [records, setRecords] = usePersistedState('fasting_history', [])

  // Re-render once a minute so the displayed figures stay current. This drives
  // the *display* only — every value is recomputed from timestamps, so a missed
  // tick (backgrounded tab, sleeping device) changes nothing.
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setTick(n => n + 1), 60_000)
    return () => clearInterval(t)
  }, [active])

  const progress = active ? fastProgress(active) : null

  const savePlan = (opts) => {
    const next = makePlan(opts)
    setPlan(next)
    return next
  }

  const begin = (startedAtMs) => {
    const p = plan || makePlan({ presetId: '16:8' })
    if (!plan) setPlan(p)
    setActive(startFast(p, startedAtMs))
  }

  /** End the running fast and file it in history. */
  const end = ({ note = '', feeling = '' } = {}) => {
    if (!active) return null
    const record = completeFast(active, { note, feeling })
    setRecords(prev => [record, ...(prev || [])].slice(0, 400))
    setActive(null)
    return record
  }

  /** Abandon without recording — for a fast started by mistake. */
  const cancel = () => setActive(null)

  const clearPlan = () => { setPlan(null); setActive(null) }

  return {
    plan, active, progress,
    records: records || [],
    stats: fastingStats(records || [], getTodayKey()),
    isFasting: !!active,
    savePlan, begin, end, cancel, clearPlan,
  }
}
