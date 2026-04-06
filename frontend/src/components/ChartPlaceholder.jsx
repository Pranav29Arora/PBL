export default function ChartPlaceholder() {
  const bars = [38, 62, 48, 78, 52, 88, 68, 82, 58, 92, 72, 86, 45, 90]

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-teal-50/30 to-white p-7 shadow-lg shadow-slate-200/25 dark:border-slate-700/50 dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-950 dark:shadow-black/30 md:p-8">
      <div className="pointer-events-none absolute -right-16 top-0 size-48 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-500/10" />
      <div className="relative mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Market pulse</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Decorative activity — your real charts live on Predict.</p>
        </div>
        <span className="rounded-full bg-gradient-to-r from-teal-500/15 to-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
          Demo
        </span>
      </div>
      <div className="relative flex h-44 items-end justify-between gap-1.5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-lg bg-gradient-to-t from-teal-600 via-teal-500/70 to-emerald-400/50 opacity-90 transition-all duration-500 hover:scale-y-[1.02] hover:opacity-100 dark:from-teal-500 dark:via-teal-400/50 dark:to-emerald-400/40"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}
