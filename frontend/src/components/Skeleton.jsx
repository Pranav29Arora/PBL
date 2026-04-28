import { motion } from 'framer-motion'

export default function Skeleton({ className }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
      className={`rounded-xl bg-slate-100 dark:bg-slate-800 ${className}`}
    />
  )
}
