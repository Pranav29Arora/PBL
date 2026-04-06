import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const linkClass = ({ isActive }) =>
  [
    'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
    isActive
      ? 'bg-gradient-to-r from-teal-600/15 to-emerald-600/10 text-teal-800 shadow-sm ring-1 ring-teal-500/20 dark:from-teal-500/20 dark:to-emerald-500/10 dark:text-teal-200 dark:ring-teal-400/25'
      : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100',
  ].join(' ')

function IconDashboard({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 13h6V4H4v9zm0 7h6v-5H4v5zm8 0h10v-9H12v9zm0-16v5h10V4H12z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  )
}
function IconPredict({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" opacity="0.92" />
    </svg>
  )
}
function IconHistory({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
        opacity="0.92"
      />
    </svg>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white/85 py-6 pl-5 pr-4 shadow-lg shadow-slate-200/30 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80 dark:shadow-black/40">
      <div className="mb-10 px-1">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-lg font-bold text-white shadow-lg shadow-teal-500/30">
            ₹
          </div>
          <div>
            <p className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
              StockVision
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-teal-600 dark:text-teal-400">
              AI
            </p>
          </div>
        </div>
        <p className="mt-4 truncate rounded-lg bg-slate-100/80 px-2.5 py-1.5 text-[11px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
          {user?.email}
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        <NavLink to="/dashboard" className={linkClass}>
          <IconDashboard className="opacity-80 group-hover:opacity-100" />
          Dashboard
        </NavLink>
        <NavLink to="/predict" className={linkClass}>
          <IconPredict className="opacity-80 group-hover:opacity-100" />
          Predict
        </NavLink>
        <NavLink to="/history" className={linkClass}>
          <IconHistory className="opacity-80 group-hover:opacity-100" />
          History
        </NavLink>
      </nav>

      <div className="mt-auto space-y-2 border-t border-slate-200/80 pt-5 dark:border-slate-800">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/90"
        >
          <span className="text-lg" aria-hidden>
            {theme === 'dark' ? '☀' : '☾'}
          </span>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
