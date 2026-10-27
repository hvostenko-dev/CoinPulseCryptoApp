import React, { Suspense } from 'react';
import Link from 'next/link';
import {
    ArrowUpRight,
    Briefcase,
    FlaskConical,
    Shield,
    Sparkles,
    Star,
} from 'lucide-react';
import CoinOverview from '@/components/home/CoinOverview';
import TrendingCoins from '@/components/home/TrendingCoins';
import MarketRadar from '@/components/home/MarketRadar';
import {
    CategoriesFallback,
    CoinOverviewFallback,
    TrendingCoinsFallback,
} from '@/components/home/fallback';
import Categories from '@/components/home/Categories';

const Page = async () => {
    return (
        <main className="main-container">
            {/* Institutional Command Header Banner */}
            <section className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-[#081221] via-[#0a1526] to-[#08121f] p-5 shadow-xl sm:p-6">
                <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />

                <div className="relative z-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-emerald-300 uppercase">
                            <Sparkles size={12} />
                            Institutional Crypto Terminal
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                            Real-Time Liquidity, Sentiment & Portfolio Alpha
                        </h1>
                        <p className="max-w-2xl text-xs text-slate-300 sm:text-sm">
                            Track multi-timeframe OHLC orderflow, monitor macro
                            market heatmaps, simulate DCA & market-cap flips, and
                            manage your real-time crypto portfolio.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                            href="/portfolio"
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 sm:text-sm"
                        >
                            <Briefcase size={16} />
                            <span>Portfolio & P&L</span>
                            <ArrowUpRight size={15} />
                        </Link>

                        <Link
                            href="/lab"
                            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20 sm:text-sm"
                        >
                            <FlaskConical size={16} />
                            <span>What-If & DCA Lab</span>
                        </Link>

                        <Link
                            href="/watchlist"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] sm:text-sm"
                        >
                            <Star size={16} className="text-amber-400" />
                            <span>Watchlist & Alerts</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Primary Chart + Trending Pulse */}
            <section className="home-grid">
                <Suspense fallback={<CoinOverviewFallback />}>
                    <CoinOverview />
                </Suspense>

                <Suspense fallback={<TrendingCoinsFallback />}>
                    <TrendingCoins />
                </Suspense>
            </section>

            {/* Macro Market Radar & Interactive Heatmap */}
            <Suspense
                fallback={
                    <div className="h-72 w-full animate-pulse rounded-2xl border border-white/5 bg-[#0a101d]/60" />
                }
            >
                <MarketRadar />
            </Suspense>

            {/* Sector & Narrative Rotation Table */}
            <section className="w-full space-y-4">
                <Suspense fallback={<CategoriesFallback />}>
                    <Categories />
                </Suspense>
            </section>
        </main>
    );
};

export default Page;
