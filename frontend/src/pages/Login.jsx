import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const res = login(email, password)
    setSubmitting(false)
    if (!res.ok) {
      push(res.error, 'error')
      return
    }
    push('Welcome back.', 'success')
    navigate(from, { replace: true })
  }

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-inner outline-none transition focus:border-teal-500/60 focus:ring-4 focus:ring-teal-500/15 dark:border-slate-600 dark:bg-slate-800/90 dark:text-white dark:focus:border-teal-400/50'

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-700 to-slate-900 p-10 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-90" />
        <div className="relative">
          <p className="font-display text-2xl font-bold">StockVision AI</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-teal-100/90">
            Forecasts in ₹, built for clarity — whether you trade India or global names.
          </p>
        </div>
        <p className="relative text-xs text-teal-200/70">Predict smarter. Invest better.</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-2xl shadow-slate-300/30 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/95 dark:shadow-black/40 md:p-10">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Credentials stay in this browser — no cloud database.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-500 hover:to-emerald-500 disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            New here?{' '}
            <Link to="/signup" className="font-bold text-teal-600 hover:underline dark:text-teal-400">
              Create account
            </Link>
          </p>
          <p className="mt-6 text-center">
            <Link to="/" className="text-xs font-medium text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300">
              ← Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
