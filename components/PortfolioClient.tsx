'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Briefcase,
    Download,
    PieChart,
    Plus,
    RefreshCw,
    Trash2,
    TrendingDown,
    TrendingUp,
    Trophy,
} from 'lucide-react';
import { useNexus } from '@/components/providers/NexusProvider';
import {
    cn,
    formatCompactNumber,
    formatCurrency,
    formatPercentage,
} from '@/lib/utils';

interface PortfolioClientProps {
    marketCoins: CoinMarketData[];
}

const ALLOCATION_COLORS = [
    'bg-emerald-500',
    'bg-cyan-500',
    'bg-blue-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-rose-500',
];

const PortfolioClient = ({ marketCoins }: PortfolioClientProps) => {
    const {
        holdings,
        addHolding,
        removeHolding,
        loadDemoPortfolio,
        clearPortfolio,
        notify,
    } = useNexus();

    const [selectedCoinId, setSelectedCoinId] = useState<string>(
        marketCoins[0]?.id ?? 'bitcoin',
    );
    const [amount, setAmount] = useState<string>('1');
    const [buyPrice, setBuyPrice] = useState<string>(
        String(marketCoins[0]?.current_price ?? 85000),
    );
    const [notes, setNotes] = useState<string>('');

    const priceMap = useMemo(() => {
        const map = new Map<string, CoinMarketData>();
        for (const coin of marketCoins) {
            map.set(coin.id, coin);
        }
        return map;
    }, [marketCoins]);

    const enrichedHoldings = useMemo(() => {
        return holdings.map((item) => {
            const liveCoin = priceMap.get(item.coinId);
            const currentPrice = liveCoin?.current_price ?? item.avgBuyPrice;
            const change24hPct = liveCoin?.price_change_percentage_24h ?? 0;
            const currentValue = item.amount * currentPrice;
            const costBasis = item.amount * item.avgBuyPrice;
            const pnl = currentValue - costBasis;
            const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

            return {
                ...item,
                currentPrice,
                change24hPct,
                currentValue,
                costBasis,
                pnl,
                pnlPct,
            };
        });
    }, [holdings, priceMap]);

    const summary = useMemo(() => {
        const totalValue = enrichedHoldings.reduce(
            (sum, h) => sum + h.currentValue,
            0,
        );
        const totalCost = enrichedHoldings.reduce(
            (sum, h) => sum + h.costBasis,
            0,
        );
        const totalPnl = totalValue - totalCost;
        const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

        const bestPerformer =
            enrichedHoldings.length > 0
                ? [...enrichedHoldings].sort((a, b) => b.pnlPct - a.pnlPct)[0]
                : null;

        return {
            totalValue,
            totalCost,
            totalPnl,
            totalPnlPct,
            bestPerformer,
        };
    }, [enrichedHoldings]);

    const handleQuickAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const coin = priceMap.get(selectedCoinId);
        const qty = parseFloat(amount);
        const buy = parseFloat(buyPrice);
        if (!coin || isNaN(qty) || qty <= 0 || isNaN(buy) || buy < 0) return;

        addHolding({
            coinId: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            image: coin.image,
            amount: qty,
            avgBuyPrice: buy,
            notes: notes.trim() || undefined,
        });
        setNotes('');
    };

    const handleExportCsv = () => {
        if (enrichedHoldings.length === 0) return;
        const headers = [
            'Asset',
            'Symbol',
            'Quantity',
            'Avg Buy Price ($)',
            'Current Price ($)',
            'Current Value ($)',
            'Net P&L ($)',
            'ROI (%)',
        ];
        const rows = enrichedHoldings.map((h) => [
            h.name,
            h.symbol.toUpperCase(),
            h.amount,
            h.avgBuyPrice.toFixed(2),
            h.currentPrice.toFixed(2),
            h.currentValue.toFixed(2),
            h.pnl.toFixed(2),
            h.pnlPct.toFixed(2),
        ]);
        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', 'nexusfi_portfolio_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        notify(
            'Portfolio CSV Exported',
            'Downloaded nexusfi_portfolio_report.csv',
            'info',
        );
    };

    const isTotalPositive = summary.totalPnl >= 0;

    return (
        <main className="main-container space-y-6">
            {/* Header Bar */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-xl sm:flex-row sm:items-center">
                <div className="flex items-center gap-3.5">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                        <Briefcase size={24} />
                    </span>
                    <div>
                        <h1 className="text-xl font-extrabold text-white sm:text-2xl">
                            Portfolio Command & P&L Analytics
                        </h1>
                        <p className="text-xs text-slate-400 sm:text-sm">
                            Real-time institutional position tracking, cost-basis
                            accounting & asset allocation
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={loadDemoPortfolio}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                    >
                        <RefreshCw size={14} />
                        <span>Load Whale Demo</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleExportCsv}
                        disabled={enrichedHoldings.length === 0}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-40"
                    >
                        <Download size={14} />
                        <span>Export CSV</span>
                    </button>

                    {enrichedHoldings.length > 0 && (
                        <button
                            type="button"
                            onClick={clearPortfolio}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
                        >
                            <Trash2 size={14} />
                            <span>Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 4 KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-lg">
                    <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                        Net Portfolio Value
                    </p>
                    <p className="mt-2 font-mono text-2xl font-extrabold text-white sm:text-3xl">
                        {formatCurrency(summary.totalValue)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-400">
                        Across {enrichedHoldings.length} active positions
                    </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-lg">
                    <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                        Total Cost Basis
                    </p>
                    <p className="mt-2 font-mono text-2xl font-extrabold text-slate-200 sm:text-3xl">
                        {formatCurrency(summary.totalCost)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-400">
                        Invested capital deployed
                    </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-lg">
                    <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                        Unrealized Net P&L
                    </p>
                    <p
                        className={cn(
                            'mt-2 font-mono text-2xl font-extrabold sm:text-3xl',
                            isTotalPositive
                                ? 'text-emerald-400'
                                : 'text-rose-400',
                        )}
                    >
                        {isTotalPositive ? '+' : ''}
                        {formatCurrency(summary.totalPnl)}
                    </p>
                    <span
                        className={cn(
                            'mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-bold',
                            isTotalPositive
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-rose-500/15 text-rose-300',
                        )}
                    >
                        {isTotalPositive ? (
                            <TrendingUp size={12} />
                        ) : (
                            <TrendingDown size={12} />
                        )}
                        {isTotalPositive ? '+' : ''}
                        {formatPercentage(summary.totalPnlPct)} ROI
                    </span>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                            Top Alpha Position
                        </p>
                        <Trophy size={16} className="text-amber-400" />
                    </div>
                    {summary.bestPerformer ? (
                        <>
                            <p className="mt-2 text-xl font-extrabold text-white">
                                {summary.bestPerformer.name} (
                                {summary.bestPerformer.symbol.toUpperCase()})
                            </p>
                            <p className="mt-1 font-mono text-xs font-bold text-emerald-400">
                                {summary.bestPerformer.pnlPct >= 0 ? '+' : ''}
                                {formatPercentage(summary.bestPerformer.pnlPct)}{' '}
                                ({formatCurrency(summary.bestPerformer.pnl)})
                            </p>
                        </>
                    ) : (
                        <p className="mt-3 text-sm text-slate-500">
                            No holdings yet
                        </p>
                    )}
                </div>
            </div>

            {/* Allocation Breakdown + Quick Position Entry */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left 2 Cols: Allocation Bar + Holdings Table */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Asset Allocation Bar */}
                    {enrichedHoldings.length > 0 && summary.totalValue > 0 && (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-xl">
                            <div className="mb-3 flex items-center gap-2">
                                <PieChart
                                    size={17}
                                    className="text-emerald-400"
                                />
                                <h3 className="text-base font-bold text-white">
                                    Portfolio Allocation Weights
                                </h3>
                            </div>

                            <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-white/10">
                                {enrichedHoldings.map((item, idx) => {
                                    const weight =
                                        (item.currentValue /
                                            summary.totalValue) *
                                        100;
                                    return (
                                        <div
                                            key={item.id}
                                            style={{ width: `${weight}%` }}
                                            className={`${ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length]} transition-all`}
                                            title={`${item.name}: ${weight.toFixed(1)}%`}
                                        />
                                    );
                                })}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-4">
                                {enrichedHoldings.map((item, idx) => {
                                    const weight =
                                        (item.currentValue /
                                            summary.totalValue) *
                                        100;
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-2 text-xs"
                                        >
                                            <span
                                                className={`size-2.5 rounded-full ${ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length]}`}
                                            />
                                            <span className="font-semibold text-white">
                                                {item.symbol.toUpperCase()}
                                            </span>
                                            <span className="font-mono text-slate-400">
                                                {weight.toFixed(1)}%
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Positions Table */}
                    <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 shadow-xl custom-scrollbar">
                        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.08] bg-[#060b14] text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                    <th className="py-4 pl-5">Asset</th>
                                    <th className="py-4 px-3 text-right">
                                        Holdings
                                    </th>
                                    <th className="py-4 px-3 text-right">
                                        Avg Buy
                                    </th>
                                    <th className="py-4 px-3 text-right">
                                        Live Price
                                    </th>
                                    <th className="py-4 px-3 text-right">
                                        Market Value
                                    </th>
                                    <th className="py-4 px-3 text-right">
                                        Net P&L
                                    </th>
                                    <th className="py-4 pr-5 text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {enrichedHoldings.map((item) => {
                                    const isUp = item.pnl >= 0;
                                    return (
                                        <tr
                                            key={item.id}
                                            className="transition hover:bg-white/[0.03]"
                                        >
                                            <td className="py-4 pl-5">
                                                <Link
                                                    href={`/coins/${item.coinId}`}
                                                    className="flex items-center gap-3"
                                                >
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        width={34}
                                                        height={34}
                                                        className="rounded-full"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-white hover:text-emerald-300">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {item.notes ||
                                                                item.symbol.toUpperCase()}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="py-4 px-3 text-right font-mono font-semibold text-white">
                                                {item.amount}{' '}
                                                <span className="text-xs text-slate-400 uppercase">
                                                    {item.symbol}
                                                </span>
                                            </td>
                                            <td className="py-4 px-3 text-right font-mono text-slate-300">
                                                {formatCurrency(
                                                    item.avgBuyPrice,
                                                )}
                                            </td>
                                            <td className="py-4 px-3 text-right font-mono text-white">
                                                {formatCurrency(
                                                    item.currentPrice,
                                                )}
                                            </td>
                                            <td className="py-4 px-3 text-right font-mono font-bold text-white">
                                                {formatCurrency(
                                                    item.currentValue,
                                                )}
                                            </td>
                                            <td className="py-4 px-3 text-right">
                                                <div
                                                    className={cn(
                                                        'font-mono text-xs font-bold',
                                                        isUp
                                                            ? 'text-emerald-400'
                                                            : 'text-rose-400',
                                                    )}
                                                >
                                                    <p>
                                                        {isUp ? '+' : ''}
                                                        {formatCurrency(
                                                            item.pnl,
                                                        )}
                                                    </p>
                                                    <p className="text-[11px] opacity-80">
                                                        ({isUp ? '+' : ''}
                                                        {formatPercentage(
                                                            item.pnlPct,
                                                        )}
                                                        )
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeHolding(item.id)
                                                    }
                                                    className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 transition hover:border-rose-500/40 hover:text-rose-400"
                                                    title="Remove Position"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Col: Add New Position Card */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-xl h-fit">
                    <h3 className="text-base font-bold text-white sm:text-lg">
                        Log New Position
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Add an asset transaction to track live P&L
                    </p>

                    <form onSubmit={handleQuickAdd} className="mt-4 space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase">
                                Select Asset
                            </label>
                            <select
                                value={selectedCoinId}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    setSelectedCoinId(id);
                                    const found = priceMap.get(id);
                                    if (found) {
                                        setBuyPrice(String(found.current_price));
                                    }
                                }}
                                className="w-full rounded-xl border border-white/15 bg-[#060a13] px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                            >
                                {marketCoins.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.symbol.toUpperCase()}) —{' '}
                                        {formatCurrency(c.current_price)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full rounded-xl border border-white/15 bg-[#060a13] px-3.5 py-2.5 font-mono text-sm text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase">
                                    Buy Price ($)
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    value={buyPrice}
                                    onChange={(e) =>
                                        setBuyPrice(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/15 bg-[#060a13] px-3.5 py-2.5 font-mono text-sm text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase">
                                Strategy Note
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. L1 core position, DCA batch #4"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full rounded-xl border border-white/15 bg-[#060a13] px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
                        >
                            <Plus size={16} />
                            <span>Add Position to Portfolio</span>
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default PortfolioClient;
