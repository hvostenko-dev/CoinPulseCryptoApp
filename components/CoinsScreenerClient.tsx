'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowUpDown,
    Bell,
    Compass,
    Flame,
    LayoutGrid,
    List,
    Plus,
    Search,
    Star,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useNexus } from '@/components/providers/NexusProvider';
import {
    cn,
    formatCompactNumber,
    formatCurrency,
    formatPercentage,
} from '@/lib/utils';

interface CoinsScreenerClientProps {
    coins: CoinMarketData[];
    currentPage: number;
}

type FilterTab = 'all' | 'watchlist' | 'gainers' | 'losers' | 'volume';
type SortField =
    | 'rank'
    | 'price'
    | 'change24h'
    | 'change7d'
    | 'mcap'
    | 'volume';

const MiniSparkline = ({
    prices,
    isPositive,
}: {
    prices?: number[];
    isPositive: boolean;
}) => {
    if (!prices || prices.length < 4) {
        return <span className="font-mono text-xs text-slate-500">—</span>;
    }

    const step = Math.max(1, Math.floor(prices.length / 28));
    const sampled = prices.filter((_, i) => i % step === 0);
    const min = Math.min(...sampled);
    const max = Math.max(...sampled);
    const range = max - min || 1;
    const width = 104;
    const height = 32;

    const points = sampled
        .map((val, idx) => {
            const x = (idx / (sampled.length - 1)) * width;
            const y = height - ((val - min) / range) * (height - 6) - 3;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');

    const stroke = isPositive ? '#10B981' : '#F43F5E';

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
        >
            <polyline
                fill="none"
                stroke={stroke}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
};

const CoinsScreenerClient = ({
    coins,
    currentPage,
}: CoinsScreenerClientProps) => {
    const { isWatched, toggleWatchlist, openAlertModal, openPortfolioModal } =
        useNexus();

    const [filterTab, setFilterTab] = useState<FilterTab>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('rank');
    const [sortAsc, setSortAsc] = useState<boolean>(true);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortAsc((prev) => !prev);
        } else {
            setSortField(field);
            setSortAsc(field === 'rank');
        }
    };

    const filteredAndSortedCoins = useMemo(() => {
        let list = [...coins];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.symbol.toLowerCase().includes(q),
            );
        }

        if (filterTab === 'watchlist') {
            list = list.filter((c) => isWatched(c.id));
        } else if (filterTab === 'gainers') {
            list = list.filter((c) => (c.price_change_percentage_24h ?? 0) > 0);
        } else if (filterTab === 'losers') {
            list = list.filter((c) => (c.price_change_percentage_24h ?? 0) < 0);
        } else if (filterTab === 'volume') {
            list = list.sort(
                (a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0),
            );
        }

        list.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'rank') {
                cmp =
                    (a.market_cap_rank ?? 9999) - (b.market_cap_rank ?? 9999);
            } else if (sortField === 'price') {
                cmp = (a.current_price ?? 0) - (b.current_price ?? 0);
            } else if (sortField === 'change24h') {
                cmp =
                    (a.price_change_percentage_24h ?? 0) -
                    (b.price_change_percentage_24h ?? 0);
            } else if (sortField === 'change7d') {
                cmp =
                    (a.price_change_percentage_7d_in_currency ?? 0) -
                    (b.price_change_percentage_7d_in_currency ?? 0);
            } else if (sortField === 'mcap') {
                cmp = (a.market_cap ?? 0) - (b.market_cap ?? 0);
            } else if (sortField === 'volume') {
                cmp = (a.total_volume ?? 0) - (b.total_volume ?? 0);
            }
            return sortAsc ? cmp : -cmp;
        });

        return list;
    }, [coins, searchQuery, filterTab, sortField, sortAsc, isWatched]);

    return (
        <div className="space-y-5">
            {/* Screener Header & Controls */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-xl lg:flex-row lg:items-center">
                <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                        <Compass size={22} />
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-extrabold text-white sm:text-2xl">
                                Institutional Asset Screener
                            </h1>
                            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300">
                                Page {currentPage}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 sm:text-sm">
                            Real-time liquidity metrics, 7-day sparklines, 24h
                            ranges & instant portfolio execution
                        </p>
                    </div>
                </div>

                {/* Search & View Switcher */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative flex-1 sm:w-64 sm:flex-initial">
                        <Search
                            size={15}
                            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter table by name/symbol..."
                            className="h-10 w-full rounded-xl border border-white/10 bg-[#060a13] pr-3 pl-9 text-xs text-white outline-none focus:border-emerald-500/60"
                        />
                    </div>

                    <div className="flex rounded-xl border border-white/10 bg-[#060a13] p-1">
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                                viewMode === 'table'
                                    ? 'bg-emerald-500 text-slate-950'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <List size={14} />
                            <span className="hidden sm:inline">Table</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('cards')}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                                viewMode === 'cards'
                                    ? 'bg-emerald-500 text-slate-950'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <LayoutGrid size={14} />
                            <span className="hidden sm:inline">Cards</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                    {(
                        [
                            { id: 'all', label: 'All Assets' },
                            { id: 'watchlist', label: '⭐ Starred Watchlist' },
                            { id: 'gainers', label: '🚀 24h Gainers' },
                            { id: 'losers', label: '🩸 24h Losers' },
                            { id: 'volume', label: '🔥 Highest Volume' },
                        ] as const
                    ).map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFilterTab(tab.id)}
                            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                                filterTab === tab.id
                                    ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-sm'
                                    : 'border border-white/[0.07] bg-[#0a101d] text-slate-400 hover:border-white/15 hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <span className="font-mono text-xs text-slate-400">
                    Showing{' '}
                    <strong className="text-white">
                        {filteredAndSortedCoins.length}
                    </strong>{' '}
                    assets
                </span>
            </div>

            {/* Empty State */}
            {filteredAndSortedCoins.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0a101d]/80 py-16 text-center">
                    <Flame size={36} className="mb-3 text-slate-500" />
                    <p className="text-base font-bold text-white">
                        No matching assets on this page
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        Try switching filter tabs or clearing your search query.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setFilterTab('all');
                            setSearchQuery('');
                        }}
                        className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : viewMode === 'cards' ? (
                /* Cards Grid View */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredAndSortedCoins.map((coin) => {
                        const change24h =
                            coin.price_change_percentage_24h ?? 0;
                        const isUp = change24h >= 0;
                        const watched = isWatched(coin.id);

                        return (
                            <div
                                key={coin.id}
                                className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 transition hover:-translate-y-0.5 hover:border-emerald-500/35 hover:shadow-xl"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <Link
                                            href={`/coins/${coin.id}`}
                                            className="flex items-center gap-3"
                                        >
                                            <Image
                                                src={coin.image}
                                                alt={coin.name}
                                                width={40}
                                                height={40}
                                                className="rounded-full"
                                            />
                                            <div>
                                                <h3 className="font-bold text-white hover:text-emerald-300">
                                                    {coin.name}
                                                </h3>
                                                <span className="font-mono text-xs text-slate-400 uppercase">
                                                    {coin.symbol} • #
                                                    {coin.market_cap_rank}
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
                                            className={`rounded-lg p-1.5 transition ${
                                                watched
                                                    ? 'text-amber-400'
                                                    : 'text-slate-500 hover:text-white'
                                            }`}
                                        >
                                            <Star
                                                size={16}
                                                className={
                                                    watched
                                                        ? 'fill-amber-400'
                                                        : ''
                                                }
                                            />
                                        </button>
                                    </div>

                                    <div className="mt-4 flex items-baseline justify-between">
                                        <span className="font-mono text-2xl font-extrabold text-white">
                                            {formatCurrency(coin.current_price)}
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
                                                <TrendingDown size={12} />
                                            )}
                                            {isUp ? '+' : ''}
                                            {formatPercentage(change24h)}
                                        </span>
                                    </div>

                                    <div className="my-3 flex items-center justify-center rounded-xl border border-white/[0.04] bg-black/25 py-2">
                                        <MiniSparkline
                                            prices={
                                                coin.sparkline_in_7d?.price
                                            }
                                            isPositive={
                                                (coin.price_change_percentage_7d_in_currency ??
                                                    change24h) >= 0
                                            }
                                        />
                                    </div>

                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between text-slate-400">
                                            <span>Market Cap</span>
                                            <span className="font-mono font-semibold text-white">
                                                {formatCompactNumber(
                                                    coin.market_cap,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>24h Volume</span>
                                            <span className="font-mono font-semibold text-slate-200">
                                                {formatCompactNumber(
                                                    coin.total_volume,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-3">
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
                                        className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-cyan-500/30 bg-cyan-500/10 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
                                    >
                                        <Plus size={14} /> Portfolio
                                    </button>
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
                                        className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
                                        title="Set Price Alert"
                                    >
                                        <Bell size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Pro Institutional Table View */
                <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 shadow-xl custom-scrollbar">
                    <table className="w-full min-w-[880px] border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.08] bg-[#060b14] text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                <th className="py-4 pl-5 w-12">★</th>
                                <th className="py-4 px-3">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('rank')}
                                        className="inline-flex items-center gap-1 hover:text-white"
                                    >
                                        # <ArrowUpDown size={12} />
                                    </button>
                                </th>
                                <th className="py-4 px-3">Asset</th>
                                <th className="py-4 px-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('price')}
                                        className="inline-flex items-center gap-1 hover:text-white"
                                    >
                                        Price <ArrowUpDown size={12} />
                                    </button>
                                </th>
                                <th className="py-4 px-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('change24h')}
                                        className="inline-flex items-center gap-1 hover:text-white"
                                    >
                                        24h % <ArrowUpDown size={12} />
                                    </button>
                                </th>
                                <th className="py-4 px-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('change7d')}
                                        className="inline-flex items-center gap-1 hover:text-white"
                                    >
                                        7d % <ArrowUpDown size={12} />
                                    </button>
                                </th>
                                <th className="py-4 px-3">24h Range</th>
                                <th className="py-4 px-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('mcap')}
                                        className="inline-flex items-center gap-1 hover:text-white"
                                    >
                                        Market Cap <ArrowUpDown size={12} />
                                    </button>
                                </th>
                                <th className="py-4 px-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('volume')}
                                        className="inline-flex items-center gap-1 hover:text-white"
                                    >
                                        24h Volume <ArrowUpDown size={12} />
                                    </button>
                                </th>
                                <th className="py-4 px-3 text-center">
                                    7D Trend
                                </th>
                                <th className="py-4 pr-5 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {filteredAndSortedCoins.map((coin) => {
                                const change24h =
                                    coin.price_change_percentage_24h ?? 0;
                                const change7d =
                                    coin.price_change_percentage_7d_in_currency ??
                                    change24h * 1.4;
                                const isUp24h = change24h >= 0;
                                const isUp7d = change7d >= 0;
                                const watched = isWatched(coin.id);

                                const low =
                                    coin.low_24h || coin.current_price * 0.96;
                                const high =
                                    coin.high_24h || coin.current_price * 1.04;
                                const rangePos = Math.min(
                                    100,
                                    Math.max(
                                        5,
                                        ((coin.current_price - low) /
                                            (high - low || 1)) *
                                            100,
                                    ),
                                );

                                return (
                                    <tr
                                        key={coin.id}
                                        className="group transition hover:bg-white/[0.03]"
                                    >
                                        <td className="py-3.5 pl-5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleWatchlist(
                                                        coin.id,
                                                        coin.name,
                                                    )
                                                }
                                                aria-label={`Star ${coin.name}`}
                                                className={`transition ${
                                                    watched
                                                        ? 'text-amber-400'
                                                        : 'text-slate-600 hover:text-slate-300'
                                                }`}
                                            >
                                                <Star
                                                    size={16}
                                                    className={
                                                        watched
                                                            ? 'fill-amber-400'
                                                            : ''
                                                    }
                                                />
                                            </button>
                                        </td>

                                        <td className="py-3.5 px-3 font-mono text-xs text-slate-400">
                                            #{coin.market_cap_rank}
                                        </td>

                                        <td className="py-3.5 px-3">
                                            <Link
                                                href={`/coins/${coin.id}`}
                                                className="flex items-center gap-3"
                                            >
                                                <Image
                                                    src={coin.image}
                                                    alt={coin.name}
                                                    width={34}
                                                    height={34}
                                                    className="rounded-full"
                                                />
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-emerald-300">
                                                        {coin.name}
                                                    </p>
                                                    <span className="font-mono text-xs text-slate-400 uppercase">
                                                        {coin.symbol}
                                                    </span>
                                                </div>
                                            </Link>
                                        </td>

                                        <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                                            {formatCurrency(coin.current_price)}
                                        </td>

                                        <td className="py-3.5 px-3 text-right">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-bold',
                                                    isUp24h
                                                        ? 'bg-emerald-500/12 text-emerald-400'
                                                        : 'bg-rose-500/12 text-rose-400',
                                                )}
                                            >
                                                {isUp24h ? '+' : ''}
                                                {formatPercentage(change24h)}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-3 text-right">
                                            <span
                                                className={cn(
                                                    'font-mono text-xs font-semibold',
                                                    isUp7d
                                                        ? 'text-emerald-400'
                                                        : 'text-rose-400',
                                                )}
                                            >
                                                {isUp7d ? '+' : ''}
                                                {formatPercentage(change7d)}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-3 w-36">
                                            <div className="space-y-1">
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                                    <div
                                                        style={{
                                                            width: `${rangePos}%`,
                                                        }}
                                                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                                                    />
                                                </div>
                                                <div className="flex justify-between font-mono text-[10px] text-slate-500">
                                                    <span>
                                                        {formatCompactNumber(
                                                            low,
                                                        )}
                                                    </span>
                                                    <span>
                                                        {formatCompactNumber(
                                                            high,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-3 text-right font-mono text-slate-200">
                                            {formatCompactNumber(
                                                coin.market_cap,
                                            )}
                                        </td>

                                        <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                                            {formatCompactNumber(
                                                coin.total_volume,
                                            )}
                                        </td>

                                        <td className="py-3.5 px-3">
                                            <div className="flex justify-center">
                                                <MiniSparkline
                                                    prices={
                                                        coin.sparkline_in_7d
                                                            ?.price
                                                    }
                                                    isPositive={isUp7d}
                                                />
                                            </div>
                                        </td>

                                        <td className="py-3.5 pr-5 text-right">
                                            <div className="inline-flex items-center gap-1.5">
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
                                                    title="Add to Portfolio"
                                                    className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-1.5 text-cyan-300 transition hover:bg-cyan-500/25"
                                                >
                                                    <Plus size={14} />
                                                </button>
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
                                                    title="Set Price Alert"
                                                    className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-300"
                                                >
                                                    <Bell size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CoinsScreenerClient;
