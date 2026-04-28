import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, TrendingUp, History, Zap, Activity, Globe, ShieldCheck, HelpCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import * as storage from '../services/storage'
import { formatStoredField } from '../services/formatInr'
import ChartPlaceholder from '../components/ChartPlaceholder'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

function StatCard({ title, value, hint, icon: Icon, colorClass = "text-indigo-600", bgClass = "bg-indigo-50 dark:bg-indigo-900/20" }) {
  return (
    <motion.div
      variants={item}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`flex size-10 items-center justify-center rounded-xl ${bgClass} ${colorClass}`}>
          <Icon className="size-5" />
        </div>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {hint && <p className="mt-2 text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{hint}</p>}
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const predictions = storage.getPredictions()
  const total = predictions.length
  const avgConf =
    total > 0
      ? Math.round(
          (predictions.reduce((s, p) => s + (Number(p.confidence) || 0), 0) / total) * 100,
        )
      : null
  const recent = predictions.slice(0, 5)

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-7xl space-y-8"
    >
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">{user?.name || 'Investor'}</span>
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Your intelligence-driven market dashboard is ready.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/predict"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
          >
            <Zap className="size-4 fill-current" />
            New Prediction
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Runs" 
          value={total} 
          icon={TrendingUp} 
          hint="Across all symbols"
        />
        <StatCard 
          title="Avg. Confidence" 
          value={avgConf != null ? `${avgConf}%` : '—'} 
          icon={Zap} 
          colorClass="text-amber-500"
          bgClass="bg-amber-50 dark:bg-amber-900/20"
          hint="Model reliability"
        />
        <StatCard 
          title="Global Reach" 
          value="US · IN" 
          icon={Globe} 
          colorClass="text-blue-500"
          bgClass="bg-blue-50 dark:bg-blue-900/20"
          hint="Exchange coverage"
        />
        <StatCard 
          title="Data Integrity" 
          value="Healthy" 
          icon={ShieldCheck} 
          colorClass="text-emerald-500"
          bgClass="bg-emerald-50 dark:bg-emerald-900/20"
          hint="System status"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={item} className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Market Momentum</h2>
                <p className="text-sm text-slate-500">Aggregated trend analysis based on your saved history.</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-1.5 dark:bg-slate-800">
                <Activity className="size-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Live</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ChartPlaceholder />
            </div>
          </motion.div>

          <motion.div variants={item} className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl">
             <HelpCircle className="size-6 text-teal-400 mb-4" />
             <h3 className="text-lg font-bold">Quick Tips</h3>
             <p className="mt-2 text-sm text-slate-400 leading-relaxed">
               Use tickers ending in <span className="text-teal-400 font-mono">.NS</span> for NSE (India) and <span className="text-teal-400 font-mono">.BO</span> for BSE (India).
             </p>
             <p className="mt-3 text-sm text-slate-400 leading-relaxed">
               Enter any stock symbol (like AAPL, RELIANCE.NS) to get AI-powered predictions for today's closing price.
             </p>
           </motion.div>
        </div>

        <motion.div variants={item}>
          <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
               <Link to="/history" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">See all</Link>
            </div>
            
            {recent.length === 0 ? (
              <div className="flex h-[400px] flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-slate-50 p-6 dark:bg-slate-800 shadow-inner">
                  <History className="size-10 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500">No predictions yet.</p>
                <Link to="/predict" className="mt-6 inline-flex rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white transition-transform hover:scale-105">
                  Start analyzing
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recent.map((p) => (
                  <div
                    key={p.id}
                    className="group flex items-center justify-between rounded-xl border border-slate-50 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md dark:border-slate-800/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-700 font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {p.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{p.symbol}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{new Date(p.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">
                        {formatStoredField(p, 'prediction')}
                      </p>
                      <div className="mt-1 flex items-center justify-end gap-1">
                        <div className="h-1 w-8 rounded-full bg-slate-200 dark:bg-slate-700">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.round(p.confidence * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                   <div className="rounded-xl bg-slate-900 p-4 text-white">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Weekly Goal</p>
                      <div className="flex items-center justify-between">
                         <p className="text-sm font-bold">12 / 20 Runs</p>
                         <p className="text-xs text-indigo-400 font-bold">60%</p>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                         <div className="h-full w-[60%] bg-indigo-500" />
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}


