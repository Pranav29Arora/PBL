import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatInr, formatInrShort } from '../services/formatInr'

export default function PriceForecastChart({ chartSeries, asOf, sameDayOpen, predictedClose, dark }) {
  if (!chartSeries?.length) return null

  const axisStroke = dark ? '#64748b' : '#94a3b8'
  const gridStroke = dark ? '#334155' : '#e2e8f0'
  const tickFill = dark ? '#94a3b8' : '#64748b'
  const lineClose = dark ? '#5eead4' : '#0d9488'
  const openDot = '#f59e0b'
  const predDot = '#10b981'

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-slate-50/80 to-emerald-50/30 p-5 shadow-lg shadow-slate-200/40 ring-1 ring-white/60 dark:border-slate-700/80 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/40 dark:shadow-black/30 dark:ring-white/5 md:p-7">
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br from-teal-400/15 to-emerald-400/10 blur-3xl dark:from-teal-500/10 dark:to-emerald-500/5" />
      <div className="relative mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600/90 dark:text-teal-400/90">
            Visual context
          </p>
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Price trail (₹)</h3>
          <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            ~2 years of daily closes.{' '}
            <span className="font-medium" style={{ color: openDot }}>
              Amber
            </span>{' '}
            = same-day open ·{' '}
            <span className="font-medium text-emerald-600 dark:text-emerald-400">Green</span> = predicted close ·{' '}
            <span className="font-mono text-slate-500 dark:text-slate-500">{asOf}</span>
          </p>
        </div>
      </div>
      <div className="relative h-[300px] w-full min-w-0 sm:h-[340px] md:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartSeries} margin={{ top: 12, right: 8, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="closeStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={lineClose} stopOpacity={0.85} />
                <stop offset="100%" stopColor={dark ? '#34d399' : '#059669'} stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke={gridStroke} vertical={false} strokeOpacity={0.65} />
            <XAxis
              dataKey="date"
              tick={{ fill: tickFill, fontSize: 10 }}
              tickLine={{ stroke: axisStroke }}
              axisLine={{ stroke: axisStroke }}
              interval="preserveStartEnd"
              minTickGap={48}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: tickFill, fontSize: 10 }}
              tickLine={{ stroke: axisStroke }}
              axisLine={{ stroke: axisStroke }}
              tickFormatter={(v) => formatInrShort(v)}
              width={68}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: dark ? '#0f172a' : '#fff',
                border: `1px solid ${dark ? '#1e293b' : '#e2e8f0'}`,
                borderRadius: '14px',
                fontSize: '12px',
                boxShadow: dark ? '0 12px 40px rgba(0,0,0,0.45)' : '0 12px 40px rgba(15,23,42,0.08)',
              }}
              labelFormatter={(l) => `Date: ${l}`}
              formatter={(value, name) => {
                if (name === 'close') return [formatInr(value), 'Close']
                return [value, name]
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
              formatter={(value) => (value === 'close' ? 'Historical close' : value)}
            />
            <Line
              type="monotone"
              dataKey="close"
              name="close"
              stroke="url(#closeStroke)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: dark ? '#0f172a' : '#fff' }}
            />
            <ReferenceDot
              x={asOf}
              y={sameDayOpen}
              r={8}
              fill={openDot}
              stroke={dark ? '#0f172a' : '#fff'}
              strokeWidth={2}
              isFront
            />
            <ReferenceDot
              x={asOf}
              y={predictedClose}
              r={8}
              fill={predDot}
              stroke={dark ? '#0f172a' : '#fff'}
              strokeWidth={2}
              isFront
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
