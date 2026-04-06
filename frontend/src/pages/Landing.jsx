import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-teal-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.25),transparent)]" />
      <div className="pointer-events-none absolute -left-40 top-1/3 size-[28rem] rounded-full bg-teal-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-emerald-600/10 blur-[90px]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 text-lg font-bold shadow-lg shadow-teal-500/30">
            ₹
          </div>
          <span className="font-display text-xl font-bold tracking-tight">StockVision AI</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/25 transition hover:brightness-110"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-6 md:pt-12">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="space-y-8">
            <p className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-200/95 backdrop-blur-sm">
              <span>Same-day close</span>
              <span className="hidden text-white/30 sm:inline">·</span>
              <span className="text-amber-200/90">Prices in ₹</span>
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-[3.25rem] xl:text-6xl">
              Predict smarter.
              <br />
              <span className="bg-gradient-to-r from-teal-200 via-emerald-200 to-teal-100 bg-clip-text text-transparent">
                Invest better.
              </span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-slate-300 md:text-lg">
              Two years of market context, same-day open from live data, and a clear forecast for the close — displayed
              in <strong className="text-white">Indian Rupees</strong> with smart handling for NSE/BSE and US listings.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="rounded-2xl bg-white px-8 py-4 text-sm font-bold text-slate-900 shadow-xl shadow-black/20 transition hover:bg-slate-100"
              >
                Create free account
              </Link>
              <Link
                to="/login"
                className="rounded-2xl border border-white/20 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-teal-500/20 to-emerald-600/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-sm font-semibold text-white/90">Signal stack</span>
                <span className="rounded-full bg-teal-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-200">
                  Live
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-8 text-sm">
                <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                  <dt className="text-slate-400">Data</dt>
                  <dd className="mt-2 font-display text-2xl font-bold text-white">2Y + yfinance</dd>
                </div>
                <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                  <dt className="text-slate-400">Models</dt>
                  <dd className="mt-2 font-display text-2xl font-bold text-white">XGB / GBM</dd>
                </div>
                <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                  <dt className="text-slate-400">FX</dt>
                  <dd className="mt-2 text-lg font-semibold text-teal-200">USD → INR</dd>
                </div>
                <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                  <dt className="text-slate-400">India</dt>
                  <dd className="mt-2 text-lg font-semibold text-amber-200/90">.NS · .BO</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
