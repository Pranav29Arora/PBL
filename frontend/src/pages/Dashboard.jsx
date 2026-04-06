import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as storage from '../services/storage'
import { formatStoredField } from '../services/formatInr'
import ChartPlaceholder from '../components/ChartPlaceholder'

function StatCard({ title, value, hint, accent }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg shadow-slate-200/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-700/50 dark:bg-slate-900/80 dark:shadow-black/30 ${accent || ''}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-teal-400/15 to-transparent blur-2xl dark:from-teal-500/10" />
      <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p className="relative mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
      {hint ? <div className="relative mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{hint}</div> : null}
    </div>
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
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-white to-teal-50/50 p-8 shadow-lg dark:border-slate-700/50 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/20 md:p-10">
        <div className="pointer-events-none absolute right-0 top-0 size-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-500/10" />
        <h1 className="relative font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="relative mt-3 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Your workspace for same-day close forecasts. New runs are priced in{' '}
          <strong className="text-slate-800 dark:text-slate-200">₹</strong> (US tickers FX-converted).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total predictions" value={total} hint="Saved in this browser only." />
        <StatCard
          title="Avg. confidence"
          value={avgConf != null ? `${avgConf}%` : '—'}
          hint="Mean holdout R² from your runs."
        />
        <StatCard
          title="Next step"
          value="Forecast"
          hint={
            <Link
              to="/predict"
              className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-500 dark:text-teal-400"
            >
              Run prediction <span aria-hidden>→</span>
            </Link>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ChartPlaceholder />
        </div>
        <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg shadow-slate-200/20 dark:border-slate-700/50 dark:bg-slate-900/85 dark:shadow-black/25 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Recent predictions</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Amounts use ₹ for new saves.</p>
          {recent.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              No predictions yet.{' '}
              <Link to="/predict" className="font-semibold text-teal-600 dark:text-teal-400">
                Start here
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-5 space-y-2.5">
              {recent.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm dark:border-slate-700/40 dark:bg-slate-800/50"
                >
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{p.symbol}</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    {formatStoredField(p, 'prediction')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
