import { useToast } from '../context/ToastContext'

const styles = {
  info: 'bg-slate-800 text-white shadow-slate-900/20 dark:bg-slate-100 dark:text-slate-900',
  success: 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-lg shadow-indigo-600/25',
  error: 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/20',
}

export default function ToastStack() {
  const { toasts } = useToast()
  if (!toasts.length) return null

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[100] flex max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition duration-300 ${styles[t.variant] || styles.info}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
