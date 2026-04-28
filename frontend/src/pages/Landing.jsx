import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { TrendingUp, Shield, BarChart2, Globe, ArrowRight, Zap, Play, LineChart } from 'lucide-react'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Decorative Orbs */}
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] size-96 rounded-full bg-indigo-500/10 blur-[120px] glow-orb" />
      <div className="pointer-events-none absolute right-[-5%] top-[20%] size-[500px] rounded-full bg-blue-500/5 blur-[150px] glow-orb" style={{ animationDelay: '-5s' }} />
      <div className="pointer-events-none absolute bottom-[-10%] left-[20%] size-96 rounded-full bg-blue-500/5 blur-[120px] glow-orb" style={{ animationDelay: '-2s' }} />

      {/* Navigation */}
      <header className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-600 text-xl font-bold text-white shadow-xl shadow-indigo-500/20">
            <LineChart className="size-6" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">
            StockVision <span className="text-indigo-400">AI</span>
          </span>
        </motion.div>
        
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
            Login
          </Link>
          <Link to="/signup" className="rounded-full bg-white px-7 py-3 text-sm font-bold text-slate-950 transition-all hover:scale-105 active:scale-95 hover:bg-slate-100 shadow-lg shadow-white/10">
            Get Started
          </Link>
        </motion.div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-32 text-center md:pt-32">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-xs font-bold text-indigo-400 backdrop-blur-sm"
        >
           <Zap className="size-3 fill-current" />
           AI-POWERED STOCK PREDICTIONS
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 font-display text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl"
        >
          Predict the <span className="text-gradient">Future</span> <br /> 
          of the Market.
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl"
        >
          Leverage high-frequency market data and proprietary XGBoost models to forecast same-day closing prices with institutional-grade precision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            to="/signup"
            className="group flex items-center gap-3 rounded-2xl bg-indigo-600 px-8 py-5 text-lg font-bold text-white shadow-2xl shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95"
          >
            Start Predicting Now
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <button className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-8 py-5 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-slate-900">
             <Play className="size-5 fill-current" />
             Watch Demo
          </button>
        </motion.div>

        {/* Ticker (Visual Only) */}
        <div className="mt-24 w-full overflow-hidden border-y border-white/5 bg-white/5 py-6 backdrop-blur-sm">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="flex gap-16 whitespace-nowrap"
          >
            {[
              'RELIANCE.NS +1.2%', 'TCS.NS -0.4%', 'AAPL +2.1%', 'NVDA +5.6%', 'INFY.NS +0.8%',
              'HDFCBANK.NS -1.1%', 'TSLA +3.2%', 'GOOGL +1.5%', 'MSFT +0.9%', 'NIFTY 50 +0.45%'
            ].map((stock, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-wider text-slate-400 uppercase">{stock.split(' ')[0]}</span>
                <span className={`text-sm font-bold ${stock.includes('-') ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {stock.split(' ')[1]}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-24 md:px-12 bg-slate-900/20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-4xl font-bold md:text-6xl">Institutional Grade Tools</h2>
            <p className="mt-4 text-slate-400 text-lg">Everything you need to navigate the volatility of modern finance.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
             {[
               { icon: Zap, title: "Real-time Processing", desc: "Live integration with Yahoo Finance API for the latest intra-day daily bars." },
               { icon: BarChart2, title: "Advanced ML Models", desc: "Utilizing XGBoost and Ensemble methods for superior predictive accuracy." },
               { icon: Globe, title: "Any Market, Any Symbol", desc: "Native support for NSE/BSE tickers (.NS, .BO) and automated FX conversion for global stocks." }
             ].map((f, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="group rounded-3xl border border-white/5 bg-slate-900/50 p-8 transition-all hover:border-indigo-500/50 hover:bg-slate-900 shadow-2xl"
               >
                 <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                   <f.icon className="size-7" />
                 </div>
                 <h3 className="text-xl font-bold">{f.title}</h3>
                 <p className="mt-3 text-slate-400 leading-relaxed">{f.desc}</p>
                 <div className="mt-6 flex items-center gap-2 text-sm font-bold text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100 uppercase tracking-widest">
                   Learn More <ArrowRight className="size-4" />
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950 px-6 py-20 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 md:flex-row">
          <div>
            <h2 className="font-display text-4xl font-bold">Ready to trade smarter?</h2>
            <p className="mt-4 text-lg text-slate-400">Join 2,000+ investors using StockVision AI today.</p>
          </div>
          <Link to="/signup" className="rounded-2xl bg-white px-10 py-5 font-bold text-slate-950 transition-all hover:bg-slate-100 hover:shadow-2xl active:scale-95">
             Get Started
          </Link>
        </div>
        <div className="mx-auto mt-20 max-w-7xl border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
           <p>© 2026 StockVision AI. For educational purposes only.</p>
           <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
           </div>
        </div>
      </footer>
    </div>
  )
}
