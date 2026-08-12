import { usePersistedState } from './usePersistedState'
import { canConvert, markConverted, normalizeInboxItem, visibleInboxItems } from '../services/captureInbox'

export function useCaptureInbox({ tasks, notes, ideas }) {
  const [stored, setStored] = usePersistedState('capture_inbox', [])
  const update = item => setStored(previous => previous.map(entry => entry.id === item.id ? item : entry))
  const convert = (item, type) => {
    if (!canConvert(item)) throw new Error('Inbox item is already converted')
    const target = type === 'task'
      ? tasks.addTask({ title: item.text, ...item.fields })
      : type === 'note'
        ? notes.addNote({ title: item.text.slice(0, 40), content: item.text })
        : ideas.addIdea({ title: item.text, category: 'Other' })
    update(markConverted(item, type, target.id))
    return target
  }
  return {
    items: visibleInboxItems(stored),
    add: data => {
      const item = normalizeInboxItem({ id: crypto.randomUUID(), ...data })
      setStored(previous => [item, ...previous]); return item
    },
    archive: id => setStored(previous => previous.map(item => item.id === id ? { ...item, status: 'archived' } : item)),
    remove: id => setStored(previous => previous.filter(item => item.id !== id)),
    convertToTask: item => convert(item, 'task'),
    convertToNote: item => convert(item, 'note'),
    convertToIdea: item => convert(item, 'idea'),
  }
}
