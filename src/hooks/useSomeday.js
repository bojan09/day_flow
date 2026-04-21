// Hook: useSomeday
// Purpose: "Someday" backlog — ideas and tasks not yet scheduled
import { useEffect } from 'react'
import { usePersistedState } from './usePersistedState'
import { getTodayKey } from '../utils/dateUtils'

const KEY = 'someday'

export function useSomeday() {
  const [items, setItems] = usePersistedState(KEY, [])

  const addItem = (title) => {
    if (!title.trim()) return
    setItems(prev => [{ id: Date.now().toString(), title: title.trim(), createdAt: new Date().toISOString() }, ...prev])
  }

  const removeItem   = (id)       => setItems(prev => prev.filter(i => i.id !== id))

  // Move to tasks — returns task data caller can pass to addTask
  const scheduleItem = (id, date = getTodayKey()) => {
    const item = items.find(i => i.id === id)
    if (!item) return null
    removeItem(id)
    return { title: item.title, date, priority: 'medium', category: 'Personal' }
  }

  return { items, addItem, removeItem, scheduleItem }
}
