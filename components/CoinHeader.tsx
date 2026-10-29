'use client';

import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
    Bell,
    Plus,
    Star,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useNexus } from '@/components/providers/NexusProvider';

const CoinHeader = ({
    coinId,
    symbol,
    livePriceChangePercentage24h,
    priceChangePercentage30d,
    name,
    image,
    livePrice,
    priceChange24h,
    high24h,
    low24h,
    marketCapRank,
}: LiveCoinHeaderProps) => {
    const { isWatched, toggleWatchlist, openAlertModal, openPortfolioModal } =
        useNexus();

    const isTrendingUp = livePriceChangePercentage24h >= 0;
    const isThirtyDayUp = priceChangePercentage30d >= 0;
    const isPriceChangeUp = priceChange24h >= 0;
    const watched = coinId ? isWatched(coinId) : false;

    const currentPrice = livePrice ?? 0;
    const low = low24h || currentPrice * 0.96;
    const high = high24h || currentPrice * 1.04;
    const rangePct = Math.min(
        100,
        Math.max(5, ((currentPrice - low) / (high - low || 1)) * 100),
    );

    const stats = [
        {
            label: '24h Return',
            value: livePriceChangePercentage24h,
            isUp: isTrendingUp,
            formatter: formatPercentage,
            showIcon: true,
        },
        {
            label: '30d Performance',
            value: priceChangePercentage30d,
            isUp: isThirtyDayUp,
            formatter: formatPercentage,
            showIcon: true,
        },
        {
            label: '24h Net Delta ($)',
            value: priceChange24h,
            isUp: isPriceChangeUp,
            formatter: formatCurrency,
            showIcon: false,
        },
    ];

    return (
        <div
            id="coin-header"
            className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-xl sm:p-6"
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <Image
                        src={image}
                        alt={name}
                        width={60}
                        height={60}
                        className="size-13 rounded-full border border-white/10 sm:size-15"
                    />
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-extrabold text-white sm:text-2xl">
                                {name}
                            </h3>
                            {symbol && (
                                <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs font-bold text-slate-300 uppercase">
                                    {symbol}
                                </span>
                            )}
                            {marketCapRank && (
                                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300">
                                    Rank #{marketCapRank}
                                </span>
                            )}
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                            <h1 className="font-mono text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                                {formatCurrency(livePrice)}
                            </h1>
                            <Badge
                                className={cn(
                                    'badge font-mono text-xs font-bold',
                                    isTrendingUp ? 'badge-up' : 'badge-down',
                                )}
                            >
                                {isTrendingUp ? '+' : ''}
                                {formatPercentage(livePriceChangePercentage24h)}
                                {isTrendingUp ? (
                                    <TrendingUp size={14} />
                                ) : (
                                    <TrendingDown size={14} />
                                )}
                                (24h)
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Institutional Action Buttons */}
                {coinId && (
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => toggleWatchlist(coinId, name)}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                                watched
                                    ? 'border-amber-400/40 bg-amber-400/15 text-amber-300'
                                    : 'border-white/10 bg-white/[0.04] text-slate-300 hover:text-white'
                            }`}
                        >
                            <Star
                                size={14}
                                className={watched ? 'fill-amber-300' : ''}
                            />
                            <span>{watched ? 'Starred' : 'Watch'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                openAlertModal({
                                    id: coinId,
                                    symbol: symbol || coinId,
                                    name,
                                    image,
                                    currentPrice,
                                })
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                            <Bell size={14} />
                            <span>Price Alert</span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                openPortfolioModal({
                                    id: coinId,
                                    symbol: symbol || coinId,
                                    name,
                                    image,
                                    currentPrice,
                                })
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:brightness-110"
                        >
                            <Plus size={14} />
                            <span>Add Position</span>
                        </button>
                    </div>
                )}
            </div>

            {/* 24h Range Progress Bar & KPIs */}
            <div className="mt-6 grid grid-cols-1 gap-5 border-t border-white/[0.07] pt-5 lg:grid-cols-2">
                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
                    {stats.map((stat) => (
                        <li
                            key={stat.label}
                            className="rounded-xl border border-white/[0.05] bg-black/25 p-3"
                        >
                            <p className="text-[11px] font-medium text-slate-400">
                                {stat.label}
                            </p>
                            <div
                                className={cn(
                                    'mt-1 flex items-center gap-1 font-mono text-sm font-bold sm:text-base',
                                    stat.isUp
                                        ? 'text-emerald-400'
                                        : 'text-rose-400',
                                )}
                            >
                                <span>
                                    {stat.isUp && stat.showIcon ? '+' : ''}
                                    {stat.formatter(stat.value)}
                                </span>
                                {stat.showIcon &&
                                    (stat.isUp ? (
                                        <TrendingUp width={14} height={14} />
                                    ) : (
                                        <TrendingDown width={14} height={14} />
                                    ))}
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="flex flex-col justify-center rounded-xl border border-white/[0.05] bg-black/25 p-3.5">
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                        <span>
                            24h Low:{' '}
                            <strong className="font-mono text-slate-200">
                                {formatCurrency(low)}
                            </strong>
                        </span>
                        <span className="hidden font-mono text-[10px] text-emerald-400 uppercase sm:inline">
                            24h Price Band
                        </span>
                        <span>
                            24h High:{' '}
                            <strong className="font-mono text-slate-200">
                                {formatCurrency(high)}
                            </strong>
                        </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                            style={{ width: `${rangePct}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoinHeader;
