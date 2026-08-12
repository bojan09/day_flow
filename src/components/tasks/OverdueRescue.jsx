import { useState } from 'react'
import { addDays, format } from 'date-fns'
import { usePersistedState } from '../../hooks/usePersistedState'
import { buildRecoveryQueue, shouldOfferRecovery } from '../../services/recovery'
import { getTodayKey } from '../../utils/dateUtils'

export default function OverdueRescue({ tasks, habits, routines, onStartFocus, onOpen }) {
  const today = getTodayKey(); const [dismissals, setDismissals] = usePersistedState('recovery_dismissals', {}); const [index, setIndex] = useState(0)
  const habitItems = habits?.habits?.map(h => ({ ...h, missed: !habits.isHabitDone(h.id) })) ?? []
  const routineItems = routines?.routines?.map(r => ({ ...r, completion: routines.getCompletion(r.id) })) ?? []
  const queue = buildRecoveryQueue({ tasks: tasks.tasks, habits: habitItems, routines: routineItems, today })
  if (dismissals[today] || !shouldOfferRecovery(queue) || !queue[index]) return null
  const item = queue[index]; const advance = action => { action?.(); setIndex(i => i + 1) }
  return <section className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}><div className="flex justify-between"><div><p className="text-sm font-semibold">A small reset</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{queue.length - index} item{queue.length-index===1?'':'s'} to review</p></div><button className="text-xs" onClick={() => setDismissals(p => ({...p,[today]:true}))}>Not today</button></div><p className="font-medium mt-4">{item.title || item.name}</p><div className="flex flex-wrap gap-2 mt-3">{item.type === 'task' ? <><button onClick={() => advance(() => onStartFocus?.(item.id))}>Do now</button><button onClick={() => advance(() => tasks.updateTask(item.id,{date:today}))}>Today</button><button onClick={() => advance(() => tasks.updateTask(item.id,{date:format(addDays(new Date(),1),'yyyy-MM-dd')}))}>Tomorrow</button><label>Pick date <input type="date" onChange={e => e.target.value && advance(() => tasks.updateTask(item.id,{date:e.target.value}))}/></label><button onClick={() => advance(() => tasks.deleteTask(item.id))}>Delete</button></> : <><button onClick={() => advance(() => item.type==='habit' ? habits.toggleHabitDay(item.id) : item.steps?.filter(s=>!routines.isStepDone(item.id,s.id)).forEach(s=>routines.toggleStep(item.id,s.id)))}>Complete</button><button onClick={() => advance()}>Skip today</button><button onClick={() => onOpen?.(item.type==='habit'?'habits':'routines')}>Open</button></>}</div></section>
}
