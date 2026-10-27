'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowUpRight,
    Bell,
    Plus,
    Star,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import CandlestickChart from '@/components/CandlestickChart';
import { TERMINAL_QUICK_COINS } from '@/constants';
import { fetcher } from '@/lib/coingecko.actions';
import {
    formatCompactNumber,
    formatCurrency,
    formatPercentage,
} from '@/lib/utils';
import { useNexus } from '@/components/providers/NexusProvider';

interface TerminalOverviewClientProps {
    initialCoin: CoinDetailsData;
    initialOhlc: OHLCData[];
}

const TerminalOverviewClient = ({
    initialCoin,
    initialOhlc,
}: TerminalOverviewClientProps) => {
    const [activeCoin, setActiveCoin] = useState<CoinDetailsData>(initialCoin);
    const [ohlcData, setOhlcData] = useState<OHLCData[]>(initialOhlc);
    const [isPending, startTransition] = useTransition();

    const { isWatched, toggleWatchlist, openAlertModal, openPortfolioModal } =
        useNexus();

    const handleSelectQuickCoin = (coinId: string) => {
        if (coinId === activeCoin.id || isPending) return;
        startTransition(async () => {
            try {
                const [newCoin, newOhlc] = await Promise.all([
                    fetcher<CoinDetailsData>(`/coins/${coinId}`, {
                        dex_pair_format: 'symbol',
                    }),
                    fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
                        vs_currency: 'usd',
                        days: 1,
                        precision: 'full',
                    }),
                ]);
                if (newCoin) setActiveCoin(newCoin);
                if (Array.isArray(newOhlc)) setOhlcData(newOhlc);
            } catch (e) {
                console.error('Failed to switch terminal asset:', e);
            }
        });
    };

    const currentPrice = activeCoin.market_data?.current_price?.usd ?? 0;
    const change24h =
        activeCoin.market_data?.price_change_percentage_24h_in_currency?.usd ??
        0;
    const isUp = change24h >= 0;
    const starred = isWatched(activeCoin.id);

    return (
        <div
            id="coin-overview"
            className="relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-4 shadow-xl sm:p-6 xl:col-span-2"
        >
            {/* Quick Asset Switcher Bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] pb-3.5">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                        Terminal Feed:
                    </span>
                    {TERMINAL_QUICK_COINS.map((item) => {
                        const isSelected = activeCoin.id === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                disabled={isPending}
                                onClick={() => handleSelectQuickCoin(item.id)}
                                className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition ${
                                    isSelected
                                        ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-sm'
                                        : 'border border-white/[0.06] bg-white/[0.03] text-slate-400 hover:border-white/15 hover:text-white'
                                }`}
                            >
                                {item.symbol}/USD
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() =>
                            toggleWatchlist(activeCoin.id, activeCoin.name)
                        }
                        title={
                            starred
                                ? 'Remove from Watchlist'
                                : 'Add to Watchlist'
                        }
                        className={`flex size-8 items-center justify-center rounded-lg border transition ${
                            starred
                                ? 'border-amber-400/40 bg-amber-400/15 text-amber-300'
                                : 'border-white/10 bg-white/[0.04] text-slate-400 hover:text-white'
                        }`}
                    >
                        <Star
                            size={15}
                            className={starred ? 'fill-amber-300' : ''}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            openAlertModal({
                                id: activeCoin.id,
                                symbol: activeCoin.symbol,
                                name: activeCoin.name,
                                image: activeCoin.image?.large || '',
                                currentPrice,
                            })
                        }
                        title="Set Price Alert"
                        className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-emerald-500/40 hover:text-emerald-300"
                    >
                        <Bell size={15} />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            openPortfolioModal({
                                id: activeCoin.id,
                                symbol: activeCoin.symbol,
                                name: activeCoin.name,
                                image: activeCoin.image?.large || '',
                                currentPrice,
                            })
                        }
                        title="Add to Portfolio"
                        className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-300"
                    >
                        <Plus size={15} />
                    </button>

                    <Link
                        href={`/coins/${activeCoin.id}`}
                        className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                    >
                        <span>Full Terminal</span>
                        <ArrowUpRight size={14} />
                    </Link>
                </div>
            </div>

            <CandlestickChart
                data={ohlcData}
                coinId={activeCoin.id}
                initialPeriod="daily"
                mode="historical"
                height={340}
            >
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Image
                            src={activeCoin.image?.large || ''}
                            alt={`${activeCoin.name} logo`}
                            width={48}
                            height={48}
                            priority
                            className="size-11 rounded-full border border-white/10 sm:size-12"
                        />

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                    {activeCoin.name} /{' '}
                                    {activeCoin.symbol.toUpperCase()}
                                </span>
                                {activeCoin.market_cap_rank && (
                                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                                        #{activeCoin.market_cap_rank}
                                    </span>
                                )}
                            </div>

                            <div className="mt-0.5 flex items-center gap-2.5">
                                <h1 className="font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    {formatCurrency(currentPrice)}
                                </h1>
                                <span
                                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-mono text-xs font-bold ${
                                        isUp
                                            ? 'bg-emerald-500/15 text-emerald-400'
                                            : 'bg-rose-500/15 text-rose-400'
                                    }`}
                                >
                                    {isUp ? (
                                        <TrendingUp size={13} />
                                    ) : (
                                        <TrendingDown size={13} />
                                    )}
                                    {isUp ? '+' : ''}
                                    {formatPercentage(change24h)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mini Telemetry KPIs */}
                    <div className="hidden items-center gap-5 border-l border-white/10 pl-5 text-xs md:flex">
                        <div>
                            <p className="text-slate-400">Market Cap</p>
                            <p className="mt-0.5 font-mono font-semibold text-white">
                                {formatCompactNumber(
                                    activeCoin.market_data?.market_cap?.usd ??
                                        0,
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-400">24h Volume</p>
                            <p className="mt-0.5 font-mono font-semibold text-white">
                                {formatCompactNumber(
                                    activeCoin.market_data?.total_volume?.usd ??
                                        0,
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </CandlestickChart>
        </div>
    );
};

export default TerminalOverviewClient;
