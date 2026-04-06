import * as storage from '../services/storage'
import { formatStoredField } from '../services/formatInr'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function History() {
  const rows = storage.getPredictions()

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="rounded-3xl border border-slate-200/60 bg-gradient-to-r from-white to-teal-50/30 p-8 shadow-md dark:border-slate-700/50 dark:from-slate-900 dark:to-teal-950/20 md:p-9">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Prediction history</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Stored in <strong className="text-slate-800 dark:text-slate-200">localStorage</strong> on this device. Rows
          saved after the INR update show <strong className="text-slate-800 dark:text-slate-200">₹</strong>; older rows
          may still show US dollars.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 shadow-xl shadow-slate-200/25 dark:border-slate-700/50 dark:bg-slate-900/90 dark:shadow-black/30">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-teal-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:from-slate-800 dark:to-teal-950/30 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">Saved</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4">Yahoo bar</th>
                <th className="px-5 py-4">Open</th>
                <th className="px-5 py-4">Prev close</th>
                <th className="px-5 py-4">Prediction</th>
                <th className="px-5 py-4">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-500 dark:text-slate-400">
                    No predictions yet. Run one from the Predict page.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className="transition hover:bg-teal-50/40 dark:hover:bg-slate-800/40"
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatDate(r.timestamp)}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-900 dark:text-white">{r.symbol}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {r.asOf || '—'}
                    </td>
                    <td className="px-5 py-3.5 tabular-nums text-slate-800 dark:text-slate-200">
                      {formatStoredField(r, 'open')}
                    </td>
                    <td className="px-5 py-3.5 tabular-nums text-slate-800 dark:text-slate-200">
                      {formatStoredField(r, 'prevClose')}
                    </td>
                    <td className="px-5 py-3.5 font-semibold tabular-nums text-teal-600 dark:text-teal-400">
                      {formatStoredField(r, 'prediction')}
                    </td>
                    <td className="px-5 py-3.5 tabular-nums">{(Number(r.confidence) * 100).toFixed(1)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
