const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Full ₹ formatting (e.g. ₹1,23,456.78). */
export function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  return inr.format(Number(amount))
}

/** Shorter axis labels — whole rupees with Indian grouping. */
export function formatInrShort(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/** History row: INR if `currency === 'INR'`, else treat amounts as legacy USD. */
export function formatStoredField(row, field) {
  const v = row[field]
  if (v == null || Number.isNaN(Number(v))) return '—'
  if (row.currency === 'INR') return formatInr(v)
  return usd.format(Number(v))
}
