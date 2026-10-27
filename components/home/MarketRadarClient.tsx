'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowUpRight,
    Flame,
    Gauge,
    Grid,
    Layers,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import {
    formatCompactNumber,
    formatCurrency,
    formatPercentage,
} from '@/lib/utils';

interface MarketRadarClientProps {
    globalData: GlobalMarketResponse['data'];
    fearGreedList: FearGreedEntry[];
    marketCoins: CoinMarketData[];
}

const MarketRadarClient = ({
    globalData,
    fearGreedList,
    marketCoins,
}: MarketRadarClientProps) => {
    const [moverTab, setMoverTab] = useState<'gainers' | 'losers'>('gainers');
    const [heatmapMode, setHeatmapMode] = useState<'mcap' | 'volume'>('mcap');
    const [heatmapCount, setHeatmapCount] = useState<12 | 20>(12);

    const currentFng = fearGreedList[0] ?? {
        value: '72',
        value_classification: 'Greed',
        timestamp: String(Math.floor(Date.now() / 1000)),
    };
    const fngScore = Math.min(100, Math.max(0, Number(currentFng.value) || 70));

    const btcDom = globalData.market_cap_percentage?.btc ?? 56.4;
    const ethDom = globalData.market_cap_percentage?.eth ?? 13.2;
    const altDom = Math.max(0, 100 - btcDom - ethDom);

    const sortedMovers = useMemo(() => {
        const copy = [...marketCoins].sort(
            (a, b) =>
                (b.price_change_percentage_24h ?? 0) -
                (a.price_change_percentage_24h ?? 0),
        );
        return moverTab === 'gainers'
            ? copy.slice(0, 4)
            : copy.reverse().slice(0, 4);
    }, [marketCoins, moverTab]);

    const heatmapCoins = useMemo(() => {
        const copy = [...marketCoins].sort((a, b) =>
            heatmapMode === 'mcap'
                ? (b.market_cap ?? 0) - (a.market_cap ?? 0)
                : (b.total_volume ?? 0) - (a.total_volume ?? 0),
        );
        return copy.slice(0, heatmapCount);
    }, [marketCoins, heatmapMode, heatmapCount]);

    const getHeatmapBg = (change: number) => {
        if (change >= 6)
            return 'border-emerald-400/50 bg-gradient-to-br from-emerald-500/35 to-emerald-900/40 text-white';
        if (change >= 2)
            return 'border-emerald-500/35 bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 text-emerald-100';
        if (change >= 0)
            return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200';
        if (change <= -6)
            return 'border-rose-400/50 bg-gradient-to-br from-rose-500/35 to-rose-900/40 text-white';
        if (change <= -2)
            return 'border-rose-500/35 bg-gradient-to-br from-rose-500/20 to-rose-950/40 text-rose-100';
        return 'border-rose-500/20 bg-rose-500/10 text-rose-200';
    };

    return (
        <section className="space-y-6">
            {/* 3-Column Macro Radar Row */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {/* Card 1: Fear & Greed Sentiment Index */}
                <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                                <Gauge size={17} />
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-white">
                                    Fear & Greed Index
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    Multi-factor market sentiment telemetry
                                </p>
                            </div>
                        </div>
                        <span
                            className={`rounded-full px-2.5 py-1 font-mono text-xs font-bold ${
                                fngScore >= 55
                                    ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                                    : fngScore <= 44
                                      ? 'border border-rose-500/30 bg-rose-500/15 text-rose-300'
                                      : 'border border-amber-500/30 bg-amber-500/15 text-amber-300'
                            }`}
                        >
                            {currentFng.value_classification}
                        </span>
                    </div>

                    <div className="my-4 flex items-center justify-between gap-4">
                        <div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="font-mono text-4xl font-extrabold text-white">
                                    {fngScore}
                                </span>
                                <span className="font-mono text-sm text-slate-400">
                                    / 100
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-400">
                                7-Day Sentiment Trend
                            </p>
                        </div>

                        {/* 7-Day Mini Bars */}
                        <div className="flex h-14 items-end gap-1.5">
                            {fearGreedList
                                .slice(0, 7)
                                .reverse()
                                .map((entry, idx) => {
                                    const v = Number(entry.value) || 50;
                                    return (
                                        <div
                                            key={idx}
                                            className="flex flex-col items-center gap-1"
                                            title={`${entry.value_classification}: ${v}/100`}
                                        >
                                            <div className="flex h-11 w-3 items-end rounded-full bg-white/5 p-0.5">
                                                <div
                                                    style={{
                                                        height: `${Math.max(20, v)}%`,
                                                    }}
                                                    className={`w-full rounded-full ${
                                                        v >= 55
                                                            ? 'bg-emerald-400'
                                                            : v <= 44
                                                              ? 'bg-rose-400'
                                                              : 'bg-amber-400'
                                                    }`}
                                                />
                                            </div>
                                            <span className="font-mono text-[9px] text-slate-500">
                                                {v}
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Gradient Meter Bar */}
                    <div>
                        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500">
                            <div
                                style={{ left: `${fngScore}%` }}
                                className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-950 bg-white shadow"
                            />
                        </div>
                        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-slate-400">
                            <span>0 Extreme Fear</span>
                            <span>50 Neutral</span>
                            <span>100 Extreme Greed</span>
                        </div>
                    </div>
                </div>

                {/* Card 2: Capital Dominance & Liquidity */}
                <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
                                <Layers size={17} />
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-white">
                                    Market Cap Dominance
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    Capital rotation across L1s & Altcoins
                                </p>
                            </div>
                        </div>
                        <span className="font-mono text-xs font-semibold text-cyan-400">
                            {(
                                globalData.markets || 1195
                            ).toLocaleString('en-US')}{' '}
                            Exchanges
                        </span>
                    </div>

                    <div className="my-4 grid grid-cols-3 gap-2.5">
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3">
                            <p className="text-[11px] font-semibold text-amber-300">
                                Bitcoin (BTC)
                            </p>
                            <p className="mt-1 font-mono text-xl font-bold text-white">
                                {btcDom.toFixed(1)}%
                            </p>
                        </div>
                        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] p-3">
                            <p className="text-[11px] font-semibold text-cyan-300">
                                Ethereum (ETH)
                            </p>
                            <p className="mt-1 font-mono text-xl font-bold text-white">
                                {ethDom.toFixed(1)}%
                            </p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
                            <p className="text-[11px] font-semibold text-emerald-300">
                                Others / Alts
                            </p>
                            <p className="mt-1 font-mono text-xl font-bold text-white">
                                {altDom.toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    <div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                                style={{ width: `${btcDom}%` }}
                                className="bg-amber-400"
                                title={`BTC: ${btcDom.toFixed(1)}%`}
                            />
                            <div
                                style={{ width: `${ethDom}%` }}
                                className="bg-cyan-400"
                                title={`ETH: ${ethDom.toFixed(1)}%`}
                            />
                            <div
                                style={{ width: `${altDom}%` }}
                                className="bg-emerald-400"
                                title={`Altcoins: ${altDom.toFixed(1)}%`}
                            />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                            <span>24h Vol / Market Cap Ratio:</span>
                            <span className="font-mono font-semibold text-white">
                                {(
                                    ((globalData.total_volume?.usd ?? 140e9) /
                                        (globalData.total_market_cap?.usd ??
                                            3.4e12)) *
                                    100
                                ).toFixed(2)}
                                %
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card 3: 24h Top Gainers & Losers Radar */}
                <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-lg md:col-span-2 xl:col-span-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                                <Flame size={17} />
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-white">
                                    24h Momentum Leaders
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    Top movers among large-cap assets
                                </p>
                            </div>
                        </div>

                        <div className="flex rounded-xl border border-white/10 bg-black/30 p-0.5 text-xs">
                            <button
                                type="button"
                                onClick={() => setMoverTab('gainers')}
                                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                                    moverTab === 'gainers'
                                        ? 'bg-emerald-500 text-slate-950'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Gainers
                            </button>
                            <button
                                type="button"
                                onClick={() => setMoverTab('losers')}
                                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                                    moverTab === 'losers'
                                        ? 'bg-rose-500 text-white'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Losers
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 space-y-2">
                        {sortedMovers.map((coin) => {
                            const change =
                                coin.price_change_percentage_24h ?? 0;
                            const isUp = change >= 0;
                            return (
                                <Link
                                    key={coin.id}
                                    href={`/coins/${coin.id}`}
                                    className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 transition hover:border-emerald-500/30 hover:bg-white/[0.05]"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Image
                                            src={coin.image}
                                            alt={coin.name}
                                            width={24}
                                            height={24}
                                            className="rounded-full"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-white">
                                                {coin.name}
                                            </p>
                                            <p className="font-mono text-[10px] text-slate-400 uppercase">
                                                {coin.symbol}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-mono text-xs font-semibold text-white">
                                            {formatCurrency(coin.current_price)}
                                        </p>
                                        <p
                                            className={`inline-flex items-center gap-0.5 font-mono text-[11px] font-bold ${
                                                isUp
                                                    ? 'text-emerald-400'
                                                    : 'text-rose-400'
                                            }`}
                                        >
                                            {isUp ? (
                                                <TrendingUp size={11} />
                                            ) : (
                                                <TrendingDown size={11} />
                                            )}
                                            {isUp ? '+' : ''}
                                            {formatPercentage(change)}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Interactive Market Cap & Volume Heatmap */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-xl">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                            <Grid size={18} />
                        </span>
                        <div>
                            <h3 className="text-base font-bold text-white sm:text-lg">
                                Interactive Market Heatmap
                            </h3>
                            <p className="text-xs text-slate-400">
                                Real-time 24h performance matrix across leading
                                digital assets
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex rounded-xl border border-white/10 bg-[#060a13] p-1 text-xs">
                            <button
                                type="button"
                                onClick={() => setHeatmapMode('mcap')}
                                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                                    heatmapMode === 'mcap'
                                        ? 'bg-emerald-500 text-slate-950'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                By Market Cap
                            </button>
                            <button
                                type="button"
                                onClick={() => setHeatmapMode('volume')}
                                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                                    heatmapMode === 'volume'
                                        ? 'bg-cyan-500 text-slate-950'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                By 24h Volume
                            </button>
                        </div>

                        <div className="flex rounded-xl border border-white/10 bg-[#060a13] p-1 text-xs">
                            {([12, 20] as const).map((cnt) => (
                                <button
                                    key={cnt}
                                    type="button"
                                    onClick={() => setHeatmapCount(cnt)}
                                    className={`rounded-lg px-2.5 py-1 font-mono font-semibold transition ${
                                        heatmapCount === cnt
                                            ? 'bg-white/15 text-white'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    Top {cnt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {heatmapCoins.map((coin, index) => {
                        const change = coin.price_change_percentage_24h ?? 0;
                        const isLargeTile = index < 2 && heatmapCount === 12;

                        return (
                            <Link
                                key={coin.id}
                                href={`/coins/${coin.id}`}
                                className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${getHeatmapBg(
                                    change,
                                )} ${
                                    isLargeTile
                                        ? 'min-h-[132px] sm:col-span-2 sm:row-span-2'
                                        : 'min-h-[96px]'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={coin.image}
                                            alt={coin.name}
                                            width={isLargeTile ? 30 : 22}
                                            height={isLargeTile ? 30 : 22}
                                            className="rounded-full"
                                        />
                                        <div>
                                            <span
                                                className={`font-mono font-extrabold tracking-tight uppercase ${
                                                    isLargeTile
                                                        ? 'text-base sm:text-lg'
                                                        : 'text-xs sm:text-sm'
                                                }`}
                                            >
                                                {coin.symbol}
                                            </span>
                                            {isLargeTile && (
                                                <p className="text-xs opacity-75">
                                                    {coin.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <ArrowUpRight
                                        size={14}
                                        className="opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                                    />
                                </div>

                                <div className="mt-3">
                                    <p
                                        className={`font-mono font-bold ${
                                            isLargeTile
                                                ? 'text-lg sm:text-2xl'
                                                : 'text-xs sm:text-sm'
                                        }`}
                                    >
                                        {formatCurrency(coin.current_price)}
                                    </p>
                                    <div className="mt-0.5 flex items-center justify-between font-mono text-[11px]">
                                        <span className="font-bold">
                                            {change >= 0 ? '+' : ''}
                                            {formatPercentage(change)}
                                        </span>
                                        <span className="opacity-70">
                                            {formatCompactNumber(
                                                heatmapMode === 'mcap'
                                                    ? coin.market_cap
                                                    : coin.total_volume,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default MarketRadarClient;
