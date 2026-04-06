import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

let id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, variant = 'info') => {
    const myId = ++id
    setToasts((t) => [...t, { id: myId, message, variant }])
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== myId))
    }, 4200)
    return myId
  }, [])

  const value = useMemo(() => ({ toasts, push }), [toasts, push])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
