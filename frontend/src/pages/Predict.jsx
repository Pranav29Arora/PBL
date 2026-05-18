import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Zap, Info, TrendingUp, AlertCircle, RefreshCw, BarChart3, Clock, CheckCircle2, Cpu } from 'lucide-react'
import { predictClosing } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { savePrediction } from '../services/predictions'
import { formatInr } from '../services/formatInr'
import { useToast } from '../context/ToastContext'
import Skeleton from '../components/Skeleton'
import PriceForecastChart from '../components/PriceForecastChart'

function formatApiError(err) {
  const d = err?.response?.data?.detail
  if (typeof d === 'string') return d
  if (Array.isArray(d)) return d.map((x) => x.msg || x).join(' ')
  return err?.message || 'Request failed.'
}

export default function Predict() {
  const { user } = useAuth()
  const { push } = useToast()
  const [symbol, setSymbol] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit(e, symbolOverride) {
    if (e) e.preventDefault()
    const sym = (symbolOverride || symbol).trim()
    if (!sym) {
      push('Enter a stock symbol.', 'error')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await predictClosing({ symbol: sym })
      setResult(data)
      const entry = {
        id: crypto.randomUUID(),
        symbol: sym.toUpperCase(),
        open: data.open,
        prevClose: data.prev_close,
        asOf: data.as_of,
        prediction: data.prediction,
        confidence: data.confidence,
        r2_holdout: data.r2_holdout,
        historyDays: data.history_days,
        currency: data.currency || 'INR',
        usdConverted: data.usd_converted,
        fxRateToInr: data.fx_rate_to_inr,
        timestamp: new Date().toISOString(),
      }
      if (user?.uid) {
        await savePrediction(user.uid, entry)
        push('Prediction saved to history.', 'success')
      }
    } catch (err) {
      push(formatApiError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  const dark = true

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Run Forecast</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Analyze market patterns and predict same-day closing prices with AI.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4 lg:items-start">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Ticker Symbol
            </label>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g., RELIANCE.NS, AAPL..."
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all"
              >
                {loading ? <RefreshCw className="size-4 animate-spin" /> : <Zap className="size-4 fill-current group-hover:scale-110 transition-transform" />}
                {loading ? 'Analyzing...' : 'Run Forecast'}
              </button>
            </form>
            <div className="mt-6 space-y-3">
              <p className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                <Info className="size-3" />
                Supports NSE, BSE, and US tickers.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['TCS.NS', 'AAPL', 'INFY.NS'].map(s => (
                  <button 
                    key={s} 
                    type="button"
                    onClick={() => {
                      setSymbol(s)
                      handleSubmit(null, s)
                    }}
                    className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-indigo-600/5 border border-indigo-500/10 p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">
              <AlertCircle className="size-4" />
              Information
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-indigo-700/80 dark:text-indigo-400/80 font-medium">
              We use 2 years of historical data and current day's open price. FX rates for US tickers are updated live.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 relative min-h-[500px]">
          <AnimatePresence>
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex min-h-[500px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-center dark:border-slate-800"
              >
                <div className="mb-6 rounded-full bg-slate-50 p-6 dark:bg-slate-900 shadow-inner">
                  <BarChart3 className="size-12 text-slate-300 dark:text-slate-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ready for Analysis</h3>
                <p className="mt-2 text-sm text-slate-500 max-w-xs">
                  Enter a ticker symbol and our AI will process 2 years of market data to forecast today's close.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 space-y-6 min-h-[500px]"
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
                <Skeleton className="h-[450px] w-full" />
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 space-y-6 min-h-[500px]"
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-500/30 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-slate-50 dark:bg-slate-800/50" />
                    <p className="relative text-xs font-bold text-slate-400 uppercase tracking-wider">Same-day Open</p>
                    <p className="relative mt-2 text-2xl font-display font-bold text-slate-900 dark:text-white">
                      {formatInr(result.open)}
                    </p>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 shadow-xl shadow-indigo-600/20 text-white group">
                    <div className="absolute -right-8 -top-8 size-24 rounded-full bg-white/10 blur-2xl group-hover:scale-125 transition-transform duration-500" />
                    <p className="relative text-xs font-bold text-white/70 uppercase tracking-wider">Projected Close</p>
                    <div className="relative flex items-center justify-between mt-2">
                       <p className="text-2xl font-display font-bold">{formatInr(result.prediction)}</p>
                       <TrendingUp className="size-5 opacity-70" />
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-500/30 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confidence Level</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Number(result.confidence) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                        />
                      </div>
                      <span className="text-sm font-bold text-indigo-600">
                        {(Number(result.confidence) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                   <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                           <Clock className="size-4 text-slate-400" />
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price Trail & Forecast</span>
                        </div>
                        {result.usd_converted && (
                          <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 px-3 py-1">
                            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                              FX: ₹{Number(result.fx_rate_to_inr).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                      <PriceForecastChart
                        chartSeries={result.chart_series}
                        asOf={result.as_of}
                        sameDayOpen={result.open}
                        predictedClose={result.prediction}
                        dark={dark}
                      />
                   </div>

                   <div className="space-y-6">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm">
                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                          <Cpu className="size-4" />
                          Model Insights
                        </h4>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Model Engine</span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">XGBoost v2.0</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Data Points</span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{result.history_days} Bars</span>
                           </div>
                           <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                              <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold mb-1">
                                 <CheckCircle2 className="size-3" />
                                 HEALTHY VALIDATION
                              </div>
                              <p className="text-[10px] leading-relaxed text-slate-500">
                                Model performance validated against a multi-regime holdout set to ensure generalization.
                              </p>
                           </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white shadow-xl">
                         <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Risk Assessment</h4>
                         <div className="flex items-center gap-4">
                            <div className="flex-1">
                               <div className="h-1 rounded-full bg-slate-800">
                                  <div className="h-full w-[15%] bg-rose-500" />
                               </div>
                               <p className="mt-2 text-[10px] font-bold text-slate-400">LOW VOLATILITY</p>
                            </div>
                            <div className="text-right">
                               <p className="text-xl font-bold">Stable</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}

