// Utils: Toast notification system — lightweight global feedback layer
// Usage: const { toast } = useToast(); toast.success('Task added!')
import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, type = 'default', duration = 3000, action = null) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type, exiting: false, action }])
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 250)
    }, duration)
  }, [])

  const toast = {
    success: (msg) => add(msg, 'success'),
    error:   (msg) => add(msg, 'error'),
    info:    (msg) => add(msg, 'info'),
    default: (msg) => add(msg, 'default'),
    undo:    (msg, onUndo) => add(msg, 'default', 5000, { label: 'Undo', onClick: onUndo }),
  }

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 250)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastStack toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext) || { toast: { success: () => {}, error: () => {}, info: () => {}, default: () => {}, undo: () => {} } }
}

const TOAST_STYLES = {
  success: '[background-color:var(--accent)] text-white',
  error:   'bg-red-500 text-white',
  info:    'bg-blue-500 text-white',
  default: '[background-color:var(--text)] [color:var(--bg)]',
}

const TOAST_ICONS = { success: '✓', error: '✕', info: 'ℹ', default: '·' }

function ToastStack({ toasts, dismiss }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`
            flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-float text-sm font-medium
            pointer-events-auto max-w-xs
            ${TOAST_STYLES[t.type] ?? TOAST_STYLES.default}
            ${t.exiting ? 'animate-toast-out' : 'animate-toast-in'}
          `}
        >
          <span className="text-xs opacity-80">{TOAST_ICONS[t.type]}</span>
          {t.message}
          {t.action && (
            <button
              type="button"
              onClick={() => { t.action.onClick?.(); dismiss(t.id) }}
              className="ml-1 underline underline-offset-2 font-semibold whitespace-nowrap"
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
