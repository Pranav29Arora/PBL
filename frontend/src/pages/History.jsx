import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { History as HistoryIcon, Download, Trash2, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { formatStoredField } from '../services/formatInr'
import { deletePrediction, subscribePredictions } from '../services/predictions'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
}

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
  const { user } = useAuth()
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (!user?.uid) return undefined
    return subscribePredictions(user.uid, setRows, () => setRows([]))
  }, [user?.uid])

  const handleDelete = async (id) => {
    if (!user?.uid) return
    await deletePrediction(user.uid, id)
  }

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Symbol', 'Open Price', 'Predicted Close', 'Confidence', 'Trend'],
      ...rows.map(r => [
        new Date(r.timestamp).toLocaleString(),
        r.symbol,
        formatStoredField(r, 'open'),
        formatStoredField(r, 'prediction'),
        `${(Number(r.confidence) * 100).toFixed(1)}%`,
        r.prediction > r.open ? 'Bullish' : 'Bearish'
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stockvision-history-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-7xl space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Forecasting History</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            A comprehensive log of all your AI-driven market predictions.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition-all"
          >
            <Download className="size-4" />
            Export CSV
          </button>
        </div>
      </div>

      <motion.div variants={item} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Open Price</th>
                <th className="px-6 py-4">Predicted Close</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4">Trend</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <HistoryIcon className="size-12 text-slate-200 dark:text-slate-800 mb-4" />
                      <p className="text-sm font-medium text-slate-500">No history found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <motion.tr
                    key={r.id}
                    variants={item}
                    className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-slate-500 dark:text-slate-400">
                      {formatDate(r.timestamp)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {r.symbol}
                    </td>
                    <td className="px-6 py-4 tabular-nums text-slate-600 dark:text-slate-400">
                      {formatStoredField(r, 'open')}
                    </td>
                    <td className="px-6 py-4 font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                      {formatStoredField(r, 'prediction')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div 
                            className="h-full bg-indigo-500" 
                            style={{ width: `${Number(r.confidence) * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold">{(Number(r.confidence) * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                         r.prediction > r.open 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : 'bg-rose-500/10 text-rose-600'
                       }`}>
                         {r.prediction > r.open ? 'Bullish' : 'Bearish'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="View on Yahoo Finance"
                          onClick={() => window.open(`https://finance.yahoo.com/quote/${r.symbol}`, '_blank')}
                        >
                          <ExternalLink className="size-4" />
                        </button>
                        <button 
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete prediction"
                          onClick={() => handleDelete(r.id)}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

