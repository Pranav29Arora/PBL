import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { 
  TrendingUp, 
  LayoutDashboard, 
  Search, 
  History, 
  LogOut, 
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Predict', path: '/predict', icon: Search },
    { label: 'History', path: '/history', icon: History },
  ]

  return (
    <motion.div
      animate={{ width: isCollapsed ? 88 : 280 }}
      className="relative flex h-screen flex-col border-r border-slate-200 bg-white/50 backdrop-blur-xl transition-colors dark:border-slate-800 dark:bg-slate-900/50"
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 z-50 flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
      >
        {isCollapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
      </button>

      <div className="flex h-20 items-center justify-center border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <TrendingUp className="size-6" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-display text-xl font-bold text-slate-900 dark:text-white"
              >
                StockVision
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4 pt-10">
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon className={`size-5 transition-transform group-hover:scale-110 ${active ? 'text-white' : ''}`} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-bold ml-4"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-[-4px] top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-white"
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-4 border-t border-slate-100 p-4 dark:border-slate-800">

        <div className={`flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 ${isCollapsed ? 'justify-center p-2' : ''}`}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-700">
            <User className="size-5 text-slate-600 dark:text-slate-300" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 ml-4">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
        >
          <LogOut className="size-5" />
          {!isCollapsed && <span className="text-sm font-bold ml-4">Sign out</span>}
        </button>
      </div>
    </motion.div>
  )
}
