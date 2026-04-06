export default function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block size-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500 ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}
