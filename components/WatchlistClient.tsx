'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowUpRight,
    Bell,
    CheckCircle2,
    Plus,
    Star,
    Trash2,
    TrendingDown,
    TrendingUp,
    Zap,
} from 'lucide-react';
import { useNexus } from '@/components/providers/NexusProvider';
import {
    cn,
    formatCompactNumber,
    formatCurrency,
    formatPercentage,
} from '@/lib/utils';

interface WatchlistClientProps {
    marketCoins: CoinMarketData[];
}

const WatchlistClient = ({ marketCoins }: WatchlistClientProps) => {
    const {
        watchlist,
        toggleWatchlist,
        alerts,
        removeAlert,
        triggerDemoAlert,
        openAlertModal,
        openPortfolioModal,
    } = useNexus();

    const watchedCoins = marketCoins.filter((c) => watchlist.includes(c.id));
    const suggestedCoins = marketCoins
        .filter((c) => !watchlist.includes(c.id))
        .slice(0, 6);

    return (
        <main className="main-container space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-xl sm:flex-row sm:items-center">
                <div className="flex items-center gap-3.5">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                        <Star size={24} className="fill-amber-400" />
                    </span>
                    <div>
                        <h1 className="text-xl font-extrabold text-white sm:text-2xl">
                            Watchlist & Automated Price Alerts
                        </h1>
                        <p className="text-xs text-slate-400 sm:text-sm">
                            Monitor high-conviction assets and configure
                            real-time threshold triggers
                        </p>
                    </div>
                </div>

                <Link
                    href="/coins"
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
                >
                    <span>Explore All Coins</span>
                    <ArrowUpRight size={15} />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left 2 Cols: Starred Coins */}
                <div className="space-y-5 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">
                            Starred Assets ({watchedCoins.length})
                        </h2>
                    </div>

                    {watchedCoins.length === 0 ? (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/80 p-10 text-center">
                            <Star
                                size={36}
                                className="mx-auto mb-3 text-slate-500"
                            />
                            <p className="text-base font-bold text-white">
                                Your Watchlist is Empty
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Click the star icon on any asset below or in the
                                Screener to track it here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {watchedCoins.map((coin) => {
                                const change24h =
                                    coin.price_change_percentage_24h ?? 0;
                                const isUp = change24h >= 0;
                                const athPct = coin.ath_change_percentage ?? 0;

                                return (
                                    <div
                                        key={coin.id}
                                        className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-lg transition hover:border-emerald-500/35"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <Link
                                                    href={`/coins/${coin.id}`}
                                                    className="flex items-center gap-3"
                                                >
                                                    <Image
                                                        src={coin.image}
                                                        alt={coin.name}
                                                        width={42}
                                                        height={42}
                                                        className="rounded-full"
                                                    />
                                                    <div>
                                                        <h3 className="font-bold text-white hover:text-emerald-300">
                                                            {coin.name}
                                                        </h3>
                                                        <span className="font-mono text-xs text-slate-400 uppercase">
                                                            {coin.symbol} • Rank
                                                            #
                                                            {
                                                                coin.market_cap_rank
                                                            }
                                                        </span>
                                                    </div>
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleWatchlist(
                                                            coin.id,
                                                            coin.name,
                                                        )
                                                    }
                                                    className="rounded-lg p-1.5 text-amber-400 hover:bg-white/10"
                                                    title="Remove from Watchlist"
                                                >
                                                    <Star
                                                        size={17}
                                                        className="fill-amber-400"
                                                    />
                                                </button>
                                            </div>

                                            <div className="mt-4 flex items-baseline justify-between">
                                                <span className="font-mono text-2xl font-extrabold text-white">
                                                    {formatCurrency(
                                                        coin.current_price,
                                                    )}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-mono text-xs font-bold',
                                                        isUp
                                                            ? 'bg-emerald-500/15 text-emerald-400'
                                                            : 'bg-rose-500/15 text-rose-400',
                                                    )}
                                                >
                                                    {isUp ? (
                                                        <TrendingUp size={12} />
                                                    ) : (
                                                        <TrendingDown
                                                            size={12}
                                                        />
                                                    )}
                                                    {isUp ? '+' : ''}
                                                    {formatPercentage(
                                                        change24h,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                                                <div className="flex justify-between">
                                                    <span>Market Cap</span>
                                                    <span className="font-mono font-semibold text-white">
                                                        {formatCompactNumber(
                                                            coin.market_cap,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>24h Volume</span>
                                                    <span className="font-mono font-semibold text-slate-200">
                                                        {formatCompactNumber(
                                                            coin.total_volume,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>From ATH</span>
                                                    <span className="font-mono text-rose-400">
                                                        {formatPercentage(
                                                            athPct,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-3.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openAlertModal({
                                                        id: coin.id,
                                                        symbol: coin.symbol,
                                                        name: coin.name,
                                                        image: coin.image,
                                                        currentPrice:
                                                            coin.current_price,
                                                    })
                                                }
                                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
                                            >
                                                <Bell size={13} /> Set Alert
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openPortfolioModal({
                                                        id: coin.id,
                                                        symbol: coin.symbol,
                                                        name: coin.name,
                                                        image: coin.image,
                                                        currentPrice:
                                                            coin.current_price,
                                                    })
                                                }
                                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
                                            >
                                                <Plus size={13} /> Portfolio
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Quick Add Suggestions */}
                    {suggestedCoins.length > 0 && (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5">
                            <h3 className="text-sm font-bold text-white">
                                Quick-Add Large Cap Assets
                            </h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {suggestedCoins.map((coin) => (
                                    <button
                                        key={coin.id}
                                        type="button"
                                        onClick={() =>
                                            toggleWatchlist(coin.id, coin.name)
                                        }
                                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300"
                                    >
                                        <Image
                                            src={coin.image}
                                            alt={coin.name}
                                            width={18}
                                            height={18}
                                            className="rounded-full"
                                        />
                                        <span>{coin.name}</span>
                                        <Plus size={13} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Col: Price Alerts Engine */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                            <Bell size={18} className="text-emerald-400" />
                            Price Alerts ({alerts.length})
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {alerts.length === 0 ? (
                            <div className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/80 p-8 text-center">
                                <Bell
                                    size={30}
                                    className="mx-auto mb-2 text-slate-500"
                                />
                                <p className="text-sm font-bold text-white">
                                    No Active Alerts
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Click &ldquo;Set Alert&rdquo; on any coin to
                                    arm a target price trigger.
                                </p>
                            </div>
                        ) : (
                            alerts.map((alert) => {
                                const liveCoin = marketCoins.find(
                                    (c) => c.id === alert.coinId,
                                );
                                const currentPrice =
                                    liveCoin?.current_price ?? 0;
                                const distancePct =
                                    currentPrice > 0
                                        ? ((alert.targetPrice - currentPrice) /
                                              currentPrice) *
                                          100
                                        : 0;

                                return (
                                    <div
                                        key={alert.id}
                                        className={`rounded-2xl border p-4 shadow-lg transition ${
                                            alert.triggered
                                                ? 'border-emerald-500/50 bg-emerald-500/10'
                                                : 'border-white/[0.08] bg-[#0a101d]/90'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={alert.image}
                                                    alt={alert.name}
                                                    className="size-8 rounded-full"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-sm font-bold text-white">
                                                            {alert.name}
                                                        </p>
                                                        <span
                                                            className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                                                                alert.condition ===
                                                                'above'
                                                                    ? 'bg-emerald-500/20 text-emerald-300'
                                                                    : 'bg-rose-500/20 text-rose-300'
                                                            }`}
                                                        >
                                                            {alert.condition}
                                                        </span>
                                                    </div>
                                                    <p className="font-mono text-xs text-slate-400">
                                                        Target:{' '}
                                                        <strong className="text-white">
                                                            {formatCurrency(
                                                                alert.targetPrice,
                                                            )}
                                                        </strong>
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeAlert(alert.id)
                                                }
                                                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-rose-400"
                                                title="Delete Alert"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                                            {currentPrice > 0 ? (
                                                <span className="font-mono text-slate-400">
                                                    Distance:{' '}
                                                    <strong className="text-slate-200">
                                                        {distancePct >= 0
                                                            ? '+'
                                                            : ''}
                                                        {distancePct.toFixed(2)}
                                                        %
                                                    </strong>
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">
                                                    Armed
                                                </span>
                                            )}

                                            {alert.triggered ? (
                                                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-400">
                                                    <CheckCircle2 size={13} />
                                                    TRIGGERED
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        triggerDemoAlert(
                                                            alert.id,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 font-mono text-[11px] font-bold text-amber-300 transition hover:bg-amber-400/20"
                                                >
                                                    <Zap size={12} />
                                                    Test Trigger
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default WatchlistClient;
