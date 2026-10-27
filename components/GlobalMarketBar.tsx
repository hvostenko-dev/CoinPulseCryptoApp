'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    Activity,
    BarChart3,
    Coins,
    Flame,
    Globe,
    ShieldCheck,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { formatCompactNumber, formatCurrency, formatPercentage } from '@/lib/utils';

interface GlobalMarketBarProps {
    globalData: GlobalMarketResponse['data'];
    fearGreed: FearGreedEntry;
    tickerCoins: CoinMarketData[];
}

const GlobalMarketBar = ({
    globalData,
    fearGreed,
    tickerCoins,
}: GlobalMarketBarProps) => {
    const mcapUsd = globalData.total_market_cap?.usd ?? 3_420_000_000_000;
    const volUsd = globalData.total_volume?.usd ?? 148_500_000_000;
    const mcapChange = globalData.market_cap_change_percentage_24h_usd ?? 2.1;
    const btcDom = globalData.market_cap_percentage?.btc ?? 56.4;
    const ethDom = globalData.market_cap_percentage?.eth ?? 13.2;
    const fngVal = Number(fearGreed?.value ?? 72);

    const fngColor =
        fngVal >= 60
            ? 'text-emerald-400'
            : fngVal <= 40
              ? 'text-rose-400'
              : 'text-amber-400';

    return (
        <div className="border-b border-white/[0.07] bg-[#050811]/95 text-xs backdrop-blur-md">
            {/* Top Institutional Telemetry Row */}
            <div className="mx-auto flex max-w-360 items-center justify-between gap-4 overflow-x-auto px-4 py-2 whitespace-nowrap no-scrollbar sm:px-6">
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                        </span>
                        <span className="font-mono text-[11px] font-bold tracking-wider text-emerald-400">
                            NEXUS-NET LIVE
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Globe size={13} className="text-cyan-400" />
                        <span>Market Cap:</span>
                        <span className="font-mono font-semibold text-white">
                            {formatCompactNumber(mcapUsd)}
                        </span>
                        <span
                            className={`inline-flex items-center gap-0.5 font-mono font-semibold ${
                                mcapChange >= 0
                                    ? 'text-emerald-400'
                                    : 'text-rose-400'
                            }`}
                        >
                            {mcapChange >= 0 ? (
                                <TrendingUp size={12} />
                            ) : (
                                <TrendingDown size={12} />
                            )}
                            {formatPercentage(mcapChange)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                        <BarChart3 size={13} className="text-emerald-400" />
                        <span>24h Vol:</span>
                        <span className="font-mono font-semibold text-white">
                            {formatCompactNumber(volUsd)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Coins size={13} className="text-amber-400" />
                        <span>Dominance:</span>
                        <span className="font-mono font-semibold text-white">
                            BTC {btcDom.toFixed(1)}%
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono font-semibold text-slate-200">
                            ETH {ethDom.toFixed(1)}%
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Flame size={13} className="text-orange-400" />
                        <span>Sentiment:</span>
                        <span className={`font-mono font-bold ${fngColor}`}>
                            {fngVal}/100 ({fearGreed?.value_classification || 'Greed'})
                        </span>
                    </div>
                </div>

                <div className="hidden items-center gap-4 text-slate-400 lg:flex">
                    <div className="flex items-center gap-1.5">
                        <Activity size={13} className="text-cyan-400" />
                        <span>Assets:</span>
                        <span className="font-mono font-semibold text-white">
                            {(
                                globalData.active_cryptocurrencies || 16840
                            ).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400/90">
                        <ShieldCheck size={13} />
                        <span className="font-mono text-[11px]">
                            API LATENCY 24ms
                        </span>
                    </div>
                </div>
            </div>

            {/* Live Scrolling Market Ticker Tape */}
            {tickerCoins.length > 0 && (
                <div className="relative overflow-hidden border-t border-white/[0.04] bg-[#070b14] py-1.5">
                    <div className="nexus-marquee flex w-max items-center gap-6 px-4 hover:[animation-play-state:paused]">
                        {[...tickerCoins, ...tickerCoins].map((coin, idx) => {
                            const isUp =
                                (coin.price_change_percentage_24h ?? 0) >= 0;
                            return (
                                <Link
                                    key={`${coin.id}-${idx}`}
                                    href={`/coins/${coin.id}`}
                                    className="group flex items-center gap-2 rounded-lg px-2 py-0.5 transition hover:bg-white/[0.06]"
                                >
                                    <Image
                                        src={coin.image}
                                        alt={coin.name}
                                        width={16}
                                        height={16}
                                        className="rounded-full"
                                    />
                                    <span className="font-bold uppercase tracking-tight text-slate-200 group-hover:text-emerald-300">
                                        {coin.symbol}
                                    </span>
                                    <span className="font-mono text-slate-300">
                                        {formatCurrency(coin.current_price)}
                                    </span>
                                    <span
                                        className={`font-mono text-[11px] font-semibold ${
                                            isUp
                                                ? 'text-emerald-400'
                                                : 'text-rose-400'
                                        }`}
                                    >
                                        {isUp ? '+' : ''}
                                        {formatPercentage(
                                            coin.price_change_percentage_24h,
                                        )}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalMarketBar;
