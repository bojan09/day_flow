import { useState } from 'react'
import { addDays, format } from 'date-fns'
import { usePersistedState } from '../../hooks/usePersistedState'
import { getTodayKey } from '../../utils/dateUtils'

export default function EndOfDayReview({ tasks }) {
  const today = getTodayKey(); const [reviews,setReviews] = usePersistedState('eod_reviews',{}); const [index,setIndex] = useState(0)
  if (new Date().getHours() < 18 || reviews[today]) return null
  const completed = tasks.tasks.filter(task => task.completedAt?.slice(0,10) === today)
  const unfinished = tasks.tasks.filter(task => !task.completed && task.date === today)
  const item = unfinished[index]
  const resolve = updates => { tasks.updateTask(item.id,updates); setIndex(i=>i+1) }
  const finish = () => setReviews(previous => ({...previous,[today]:{completedCount:completed.length,unresolvedCount:unfinished.length-index,finishedAt:new Date().toISOString()}}))
  return <section className="rounded-2xl border p-5" style={{backgroundColor:'var(--surface)',borderColor:'var(--border)'}}><h2 className="text-xs font-semibold uppercase tracking-widest" style={{color:'var(--accent)'}}>End of Day Review</h2><p className="text-sm mt-2">You completed {completed.length} task{completed.length===1?'':'s'} today.</p>{item ? <div className="mt-4"><p className="text-xs" style={{color:'var(--text-muted)'}}>Unfinished today</p><p className="font-medium">{item.title}</p><div className="flex flex-wrap gap-2 mt-2"><button onClick={()=>resolve({date:format(addDays(new Date(),1),'yyyy-MM-dd')})}>Move to tomorrow</button><label>Pick date <input type="date" onChange={e=>e.target.value&&resolve({date:e.target.value})}/></label><button onClick={()=>setIndex(i=>i+1)}>Keep overdue</button></div></div> : <p className="text-sm mt-4">Everything has a decision.</p>}<div className="flex gap-2 mt-4"><button onClick={()=>window.dispatchEvent(new Event('dayflow:quickcapture'))} className="rounded-xl border px-3 py-2">Quick Capture</button><button onClick={finish} className="rounded-xl px-3 py-2 text-white" style={{backgroundColor:'var(--accent)'}}>Finish Day</button></div></section>
}
