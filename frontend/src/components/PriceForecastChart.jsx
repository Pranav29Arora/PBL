import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Area,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatInr, formatInrShort } from '../services/formatInr'

export default function PriceForecastChart({ chartSeries, asOf, sameDayOpen, predictedClose, dark }) {
  if (!chartSeries?.length) return null

  const axisStroke = dark ? '#334155' : '#e2e8f0'
  const gridStroke = dark ? '#1e293b' : '#f1f5f9'
  const tickFill = dark ? '#94a3b8' : '#64748b'
  const lineClose = dark ? '#6366f1' : '#4f46e5'
  const openDot = '#f59e0b'
  const predDot = '#3b82f6'

  return (
    <div className="relative h-[400px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartSeries} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineClose} stopOpacity={0.3} />
              <stop offset="95%" stopColor={lineClose} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={lineClose} />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: tickFill, fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={60}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fill: tickFill, fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatInrShort(v)}
            width={70}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: dark ? '#0f172a' : '#fff',
              border: `1px solid ${dark ? '#1e293b' : '#e2e8f0'}`,
              borderRadius: '16px',
              padding: '12px 16px',
              fontSize: '12px',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            }}
            itemStyle={{ fontWeight: 600, color: dark ? '#f1f5f9' : '#1e293b' }}
            labelStyle={{ color: dark ? '#94a3b8' : '#64748b', marginBottom: '4px', fontWeight: 600 }}
            cursor={{ stroke: axisStroke, strokeWidth: 2 }}
            formatter={(value) => [formatInr(value), 'Price']}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke="none"
            fillOpacity={1}
            fill="url(#colorClose)"
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, stroke: dark ? '#0f172a' : '#fff', strokeWidth: 2 }}
          />
          <ReferenceDot
            x={asOf}
            y={sameDayOpen}
            r={6}
            fill={openDot}
            stroke={dark ? '#0f172a' : '#fff'}
            strokeWidth={2}
            isFront
          />
          <ReferenceDot
            x={asOf}
            y={predictedClose}
            r={6}
            fill={predDot}
            stroke={dark ? '#0f172a' : '#fff'}
            strokeWidth={2}
            isFront
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

