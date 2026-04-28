import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Mail, Lock, User, UserPlus, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Signup() {
  const { signup } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) {
      push('Password must be at least 6 characters.', 'error')
      return
    }
    setSubmitting(true)
    const res = signup(name, email, password)
    setSubmitting(false)
    if (!res.ok) {
      push(res.error, 'error')
      return
    }
    push('Account created. You are signed in.', 'success')
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative hidden w-[45%] lg:flex flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-slate-900 to-slate-900" />
          <div className="absolute -left-20 -top-20 size-96 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 size-96 rounded-full bg-indigo-500/5 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg">
              <TrendingUp className="size-6" />
            </div>
            <span className="font-display text-2xl font-bold">StockVision <span className="text-indigo-400">AI</span></span>
          </Link>
          
          <div className="mt-20 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">Start your journey to smarter investing.</h2>
            <p className="mt-6 text-lg text-slate-400">
               Join a community of data-driven investors. All your data is encrypted and stored locally.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8">
           <p className="text-sm text-slate-500">Built for PBL project excellence.</p>
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create account</h1>
            <p className="mt-2 text-slate-500">Join StockVision AI and start predicting today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  placeholder="John Doe"
                />
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
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
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
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
              >
                {submitting ? <RefreshCw className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                {submitting ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">Sign in instead</Link>
          </p>

          <Link to="/" className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="size-3" />
            Back to landing page
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

