import { useState } from 'react'
import { predictClosing } from '../services/api'
import * as storage from '../services/storage'
import { formatInr } from '../services/formatInr'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import Spinner from '../components/Spinner'
import PriceForecastChart from '../components/PriceForecastChart'

function formatApiError(err) {
  const d = err?.response?.data?.detail
  if (typeof d === 'string') return d
  if (Array.isArray(d)) return d.map((x) => x.msg || x).join(' ')
  return err?.message || 'Request failed.'
}

export default function Predict() {
  const { push } = useToast()
  const { theme } = useTheme()
  const [symbol, setSymbol] = useState('RELIANCE.NS')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const sym = symbol.trim()
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
      storage.appendPrediction(entry)
      push('Prediction saved to history.', 'success')
    } catch (err) {
      push(formatApiError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  const dark = theme === 'dark'

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-white to-teal-50/40 p-8 shadow-lg shadow-slate-200/30 dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/30 dark:shadow-none md:p-10">
        <div className="pointer-events-none absolute -right-24 top-0 size-72 rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-300/10 blur-3xl dark:from-teal-500/15 dark:to-emerald-600/10" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-teal-800 dark:border-teal-500/30 dark:bg-teal-950/50 dark:text-teal-300">
              <span aria-hidden>₹</span> All prices in Indian Rupees
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Same-day close forecast
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Trained on <strong className="text-slate-800 dark:text-slate-200">two years</strong> of Yahoo Finance
              data, using the latest bar&apos;s <strong className="text-slate-800 dark:text-slate-200">open</strong> to
              predict that day&apos;s <strong className="text-slate-800 dark:text-slate-200">close</strong>. US listings
              are converted with live <strong className="text-slate-800 dark:text-slate-200">USD/INR</strong>;{' '}
              <strong className="text-slate-800 dark:text-slate-200">.NS</strong> /{' '}
              <strong className="text-slate-800 dark:text-slate-200">.BO</strong> symbols are already in ₹.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="h-fit space-y-6 rounded-3xl border border-slate-200/70 bg-white/90 p-7 shadow-xl shadow-slate-200/20 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/90 dark:shadow-black/20"
        >
          <div>
            <label htmlFor="symbol" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Stock symbol
            </label>
            <input
              id="symbol"
              name="symbol"
              autoComplete="off"
              spellCheck={false}
              placeholder="RELIANCE.NS, TCS.NS, AAPL…"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="ticker-input w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3.5 font-mono text-sm text-slate-900 shadow-inner outline-none ring-2 ring-transparent transition-colors duration-150 hover:bg-slate-100/90 focus:border-teal-500/50 focus:bg-slate-50 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white dark:hover:bg-slate-800/95 dark:focus:border-teal-400/50 dark:focus:bg-slate-800 dark:focus:ring-teal-500/25"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
              NSE: <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">TICKER.NS</code> · BSE:{' '}
              <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">TICKER.BO</code>
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 py-4 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-500 hover:to-emerald-500 hover:shadow-teal-500/30 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Spinner className="size-5 border-2 border-white/30 border-t-white" />
                Fetching data &amp; running model…
              </>
            ) : (
              'Generate prediction'
            )}
          </button>
        </form>

        <div className="flex min-h-[300px] flex-col justify-center rounded-3xl border border-dashed border-slate-300/90 bg-gradient-to-b from-slate-50/90 to-white/50 p-7 dark:border-slate-600/50 dark:from-slate-900/50 dark:to-slate-950/30">
          {!result && !loading ? (
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Ready when you are</p>
              <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-500">
                You&apos;ll get open, predicted close, confidence, and a full price chart — all in ₹.
              </p>
            </div>
          ) : null}
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-10">
              <Spinner />
              <p className="text-sm text-slate-600 dark:text-slate-400">Fetching market data and training…</p>
            </div>
          ) : null}
          {result ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-4 dark:border-slate-700/80">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Target session
                  </p>
                  <p className="font-mono text-sm font-medium text-slate-800 dark:text-slate-100">{result.as_of}</p>
                  {result.history_days != null ? (
                    <p className="mt-1 text-[11px] text-slate-500">{result.history_days} daily bars (~2y)</p>
                  ) : null}
                </div>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-900 dark:bg-teal-500/20 dark:text-teal-200">
                  INR
                </span>
              </div>

              {result.usd_converted ? (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-200/90">
                  US listing: prices converted at USD/INR ≈{' '}
                  <span className="font-mono font-semibold">{Number(result.fx_rate_to_inr).toFixed(4)}</span> (Yahoo FX,
                  cached ~30m).
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3 text-left text-sm">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/60">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Same-day open</p>
                  <p className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                    {formatInr(result.open)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/60">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Prev close</p>
                  <p className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                    {formatInr(result.prev_close)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-[1px] shadow-lg shadow-teal-600/20">
                <div className="rounded-[15px] bg-white px-5 py-6 text-center dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                    Predicted same-day close
                  </p>
                  <p className="mt-2 font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl">
                    {formatInr(result.prediction)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-800/60">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Confidence</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    {(Number(result.confidence) * 100).toFixed(1)}%
                  </p>
                </div>
                {result.r2_holdout != null ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-800/60">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Raw R² (holdout)</p>
                    <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                      {Number(result.r2_holdout).toFixed(3)}
                    </p>
                  </div>
                ) : null}
              </div>
              <p className="text-center text-[11px] text-slate-500 dark:text-slate-500">
                Not financial advice. Markets and FX move quickly.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {result?.chart_series?.length ? (
        <div className="min-w-0">
        <PriceForecastChart
          chartSeries={result.chart_series}
          asOf={result.as_of}
          sameDayOpen={result.open}
          predictedClose={result.prediction}
          dark={dark}
        />
        </div>
      ) : null}
    </div>
  )
}
