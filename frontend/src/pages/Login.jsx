import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Mail, Lock, LogIn, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const res = await login(email, password)
    setSubmitting(false)
    if (!res.ok) {
      push(res.error, 'error')
      return
    }
    push('Welcome back.', 'success')
    navigate(from, { replace: true })
  }

  async function handleGoogleLogin() {
    setSubmitting(true)
    const res = await loginWithGoogle()
    setSubmitting(false)
    if (!res.ok) {
      push(res.error, 'error')
      return
    }
    push('Signed in with Google.', 'success')
    navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative hidden w-[45%] lg:flex flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-slate-900 to-slate-900" />
          <div className="absolute -left-20 -top-20 size-96 rounded-full bg-indigo-500/10 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 size-96 rounded-full bg-emerald-500/5 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg">
              <TrendingUp className="size-6" />
            </div>
            <span className="font-display text-2xl font-bold">StockVision <span className="text-indigo-400">AI</span></span>
          </Link>
          
          <div className="mt-20 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">Master the market with precision.</h2>
            <p className="mt-6 text-lg text-slate-400">
               Join over 2,000 investors using our AI-driven insights to navigate global markets with confidence.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-end border-t border-white/10 pt-8">
           <p className="text-sm text-slate-500">v1.2.0</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
            <p className="mt-2 text-slate-500">Enter your details to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <span className="text-base">G</span>
              {submitting ? 'Please wait...' : 'Continue with Google'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-wider text-slate-400">
                <span className="bg-slate-50 px-3 dark:bg-slate-950">Or continue with email</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
            >
              {submitting ? <RefreshCw className="size-4 animate-spin" /> : <LogIn className="size-4" />}
              {submitting ? 'Authenticating...' : 'Sign in to Dashboard'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-indigo-600 hover:text-indigo-700">Create account</Link>
          </p>

          <Link to="/" className="mt-12 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="size-3" />
            Back to landing page
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

