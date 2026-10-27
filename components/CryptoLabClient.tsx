'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import {
    ArrowLeftRight,
    Calculator,
    FlaskConical,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import {
    formatCompactNumber,
    formatCurrency,
    formatPercentage,
} from '@/lib/utils';

interface CryptoLabClientProps {
    marketCoins: CoinMarketData[];
}

const PRESET_COMPARISONS = [
    { label: 'SOL at ETH Market Cap', base: 'solana', target: 'ethereum' },
    { label: 'ETH at BTC Market Cap', base: 'ethereum', target: 'bitcoin' },
    { label: 'LINK at SOL Market Cap', base: 'chainlink', target: 'solana' },
    { label: 'SUI at SOL Market Cap', base: 'sui', target: 'solana' },
    { label: 'DOGE at BNB Market Cap', base: 'dogecoin', target: 'binancecoin' },
];

const CryptoLabClient = ({ marketCoins }: CryptoLabClientProps) => {
    // Market Cap Comparator State
    const [coinAId, setCoinAId] = useState<string>('solana');
    const [coinBId, setCoinBId] = useState<string>('ethereum');
    const [holdingTokens, setHoldingTokens] = useState<string>('50');

    // DCA Simulator State
    const [initialCapital, setInitialCapital] = useState<string>('1000');
    const [monthlyContribution, setMonthlyContribution] =
        useState<string>('400');
    const [years, setYears] = useState<number>(4);
    const [annualReturnPct, setAnnualReturnPct] = useState<number>(38);

    const coinA = useMemo(
        () =>
            marketCoins.find((c) => c.id === coinAId) ??
            marketCoins[2] ??
            marketCoins[0],
        [marketCoins, coinAId],
    );
    const coinB = useMemo(
        () =>
            marketCoins.find((c) => c.id === coinBId) ??
            marketCoins[1] ??
            marketCoins[0],
        [marketCoins, coinBId],
    );

    const comparison = useMemo(() => {
        if (!coinA || !coinB) return null;
        const mcapA = coinA.market_cap || 1;
        const mcapB = coinB.market_cap || 1;
        const multiplier = mcapB / mcapA;
        const impliedPrice = coinA.current_price * multiplier;
        const upsidePct = (multiplier - 1) * 100;
        const tokens = parseFloat(holdingTokens) || 0;
        const currentHoldingsVal = tokens * coinA.current_price;
        const projectedHoldingsVal = tokens * impliedPrice;

        return {
            multiplier,
            impliedPrice,
            upsidePct,
            currentHoldingsVal,
            projectedHoldingsVal,
        };
    }, [coinA, coinB, holdingTokens]);

    const dcaProjection = useMemo(() => {
        const init = Math.max(0, parseFloat(initialCapital) || 0);
        const monthly = Math.max(0, parseFloat(monthlyContribution) || 0);
        const rMonthly = annualReturnPct / 100 / 12;

        const yearlyBreakdown: {
            year: number;
            invested: number;
            totalValue: number;
            profit: number;
        }[] = [];

        let balance = init;
        let invested = init;

        for (let y = 1; y <= years; y++) {
            for (let m = 1; m <= 12; m++) {
                balance = (balance + monthly) * (1 + rMonthly);
                invested += monthly;
            }
            yearlyBreakdown.push({
                year: y,
                invested,
                totalValue: balance,
                profit: balance - invested,
            });
        }

        const final = yearlyBreakdown[yearlyBreakdown.length - 1] ?? {
            year: years,
            invested: init,
            totalValue: init,
            profit: 0,
        };

        return {
            yearlyBreakdown,
            totalInvested: final.invested,
            finalBalance: final.totalValue,
            totalProfit: final.profit,
            roiPct:
                final.invested > 0
                    ? (final.profit / final.invested) * 100
                    : 0,
        };
    }, [initialCapital, monthlyContribution, years, annualReturnPct]);

    const swapCoins = () => {
        setCoinAId(coinBId);
        setCoinBId(coinAId);
    };

    return (
        <main className="main-container space-y-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-xl sm:flex-row sm:items-center">
                <div className="flex items-center gap-3.5">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                        <FlaskConical size={24} />
                    </span>
                    <div>
                        <h1 className="text-xl font-extrabold text-white sm:text-2xl">
                            NexusFi Quantitative Crypto Lab
                        </h1>
                        <p className="text-xs text-slate-400 sm:text-sm">
                            Simulate market-cap flippenings, token valuation
                            multipliers & multi-year DCA compounding
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 1: Market Cap "What-If" Comparator */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-xl sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
                    <div>
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                            <Sparkles size={12} />
                            Valuation Flippening Engine
                        </span>
                        <h2 className="mt-0.5 text-lg font-extrabold text-white sm:text-xl">
                            Market Cap &ldquo;What-If&rdquo; Comparator
                        </h2>
                    </div>

                    {/* Preset Scenarios */}
                    <div className="flex flex-wrap gap-1.5">
                        {PRESET_COMPARISONS.map((preset) => (
                            <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                    if (
                                        marketCoins.some(
                                            (c) => c.id === preset.base,
                                        )
                                    )
                                        setCoinAId(preset.base);
                                    if (
                                        marketCoins.some(
                                            (c) => c.id === preset.target,
                                        )
                                    )
                                        setCoinBId(preset.target);
                                }}
                                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                {coinA && coinB && comparison && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Selectors Column */}
                        <div className="space-y-4 lg:col-span-5">
                            <div className="rounded-2xl border border-white/[0.07] bg-[#060a13] p-4">
                                <label className="mb-2 block text-xs font-bold tracking-wider text-emerald-400 uppercase">
                                    Asset A (Base Token to Project)
                                </label>
                                <select
                                    value={coinA.id}
                                    onChange={(e) => setCoinAId(e.target.value)}
                                    className="w-full rounded-xl border border-white/15 bg-[#0a101d] px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-emerald-500"
                                >
                                    {marketCoins.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.symbol.toUpperCase()})
                                            — MCap:{' '}
                                            {formatCompactNumber(c.market_cap)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={swapCoins}
                                    className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/50 hover:text-white"
                                >
                                    <ArrowLeftRight size={15} />
                                    Swap Assets
                                </button>
                            </div>

                            <div className="rounded-2xl border border-white/[0.07] bg-[#060a13] p-4">
                                <label className="mb-2 block text-xs font-bold tracking-wider text-cyan-400 uppercase">
                                    Asset B (Target Market Cap Benchmark)
                                </label>
                                <select
                                    value={coinB.id}
                                    onChange={(e) => setCoinBId(e.target.value)}
                                    className="w-full rounded-xl border border-white/15 bg-[#0a101d] px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-cyan-500"
                                >
                                    {marketCoins.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.symbol.toUpperCase()})
                                            — MCap:{' '}
                                            {formatCompactNumber(c.market_cap)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="rounded-2xl border border-white/[0.07] bg-[#060a13] p-4">
                                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase">
                                    Simulate Your {coinA.symbol.toUpperCase()}{' '}
                                    Bag Size (Tokens)
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={holdingTokens}
                                    onChange={(e) =>
                                        setHoldingTokens(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/15 bg-[#0a101d] px-3.5 py-2.5 font-mono text-sm text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Output Projection Column */}
                        <div className="flex flex-col justify-between rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-[#07131e] via-[#091526] to-[#07111a] p-6 lg:col-span-7">
                            <div>
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={coinA.image}
                                            alt={coinA.name}
                                            width={44}
                                            height={44}
                                            className="rounded-full"
                                        />
                                        <div>
                                            <p className="text-xs text-slate-400">
                                                If{' '}
                                                <strong className="text-white">
                                                    {coinA.name}
                                                </strong>{' '}
                                                reached{' '}
                                                <strong className="text-cyan-300">
                                                    {coinB.name}&apos;s
                                                </strong>{' '}
                                                Market Cap (
                                                {formatCompactNumber(
                                                    coinB.market_cap,
                                                )}
                                                ):
                                            </p>
                                            <h3 className="mt-1 font-mono text-3xl font-extrabold text-white sm:text-4xl">
                                                1 {coinA.symbol.toUpperCase()} ={' '}
                                                <span className="text-emerald-400">
                                                    {formatCurrency(
                                                        comparison.impliedPrice,
                                                    )}
                                                </span>
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/15 px-4 py-2.5 text-right">
                                        <p className="font-mono text-2xl font-extrabold text-emerald-300">
                                            {comparison.multiplier.toFixed(2)}x
                                        </p>
                                        <p className="font-mono text-xs text-emerald-200/80">
                                            {comparison.upsidePct >= 0
                                                ? '+'
                                                : ''}
                                            {formatPercentage(
                                                comparison.upsidePct,
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div className="rounded-xl border border-white/[0.07] bg-black/30 p-3.5">
                                        <p className="text-xs text-slate-400">
                                            Current {coinA.symbol.toUpperCase()}{' '}
                                            Price
                                        </p>
                                        <p className="mt-1 font-mono text-base font-bold text-white">
                                            {formatCurrency(
                                                coinA.current_price,
                                            )}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-white/[0.07] bg-black/30 p-3.5">
                                        <p className="text-xs text-slate-400">
                                            Current Bag Value ({holdingTokens}{' '}
                                            {coinA.symbol.toUpperCase()})
                                        </p>
                                        <p className="mt-1 font-mono text-base font-bold text-slate-200">
                                            {formatCurrency(
                                                comparison.currentHoldingsVal,
                                            )}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                                        <p className="text-xs text-emerald-300">
                                            Projected Bag Value
                                        </p>
                                        <p className="mt-1 font-mono text-base font-extrabold text-emerald-400">
                                            {formatCurrency(
                                                comparison.projectedHoldingsVal,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Market Cap Ratio Bar */}
                            <div className="mt-6 border-t border-white/10 pt-4">
                                <div className="mb-2 flex justify-between text-xs text-slate-300">
                                    <span>
                                        {coinA.name} MCap:{' '}
                                        <strong className="font-mono text-white">
                                            {formatCompactNumber(
                                                coinA.market_cap,
                                            )}
                                        </strong>
                                    </span>
                                    <span>
                                        {coinB.name} MCap:{' '}
                                        <strong className="font-mono text-cyan-300">
                                            {formatCompactNumber(
                                                coinB.market_cap,
                                            )}
                                        </strong>
                                    </span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                                    <div
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                Math.max(
                                                    4,
                                                    (coinA.market_cap /
                                                        (coinB.market_cap ||
                                                            1)) *
                                                        100,
                                                ),
                                            )}%`,
                                        }}
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Section 2: DCA & Compounding Wealth Simulator */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-xl sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                            <Calculator size={20} />
                        </span>
                        <div>
                            <h2 className="text-lg font-extrabold text-white sm:text-xl">
                                Dollar-Cost Averaging (DCA) & Compounding
                                Simulator
                            </h2>
                            <p className="text-xs text-slate-400">
                                Model systematic crypto accumulation across
                                market cycles
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {[
                            { label: 'Conservative (18% APY)', rate: 18 },
                            { label: 'Balanced Bull (38% APY)', rate: 38 },
                            { label: 'Cycle Alpha (65% APY)', rate: 65 },
                        ].map((preset) => (
                            <button
                                key={preset.label}
                                type="button"
                                onClick={() => setAnnualReturnPct(preset.rate)}
                                className={`rounded-xl px-3 py-1.5 font-mono text-xs font-semibold transition ${
                                    annualReturnPct === preset.rate
                                        ? 'bg-emerald-500 text-slate-950 font-bold'
                                        : 'border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white'
                                }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* DCA Inputs */}
                    <div className="space-y-4 lg:col-span-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase">
                                Initial Lump Sum Investment ($)
                            </label>
                            <input
                                type="number"
                                value={initialCapital}
                                onChange={(e) =>
                                    setInitialCapital(e.target.value)
                                }
                                className="w-full rounded-xl border border-white/15 bg-[#060a13] px-3.5 py-2.5 font-mono text-sm text-white outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase">
                                Monthly Recurring DCA Contribution ($)
                            </label>
                            <input
                                type="number"
                                value={monthlyContribution}
                                onChange={(e) =>
                                    setMonthlyContribution(e.target.value)
                                }
                                className="w-full rounded-xl border border-white/15 bg-[#060a13] px-3.5 py-2.5 font-mono text-sm text-white outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <div className="mb-1.5 flex justify-between text-xs">
                                <span className="font-semibold text-slate-400 uppercase">
                                    Investment Horizon
                                </span>
                                <span className="font-mono font-bold text-emerald-400">
                                    {years} {years === 1 ? 'Year' : 'Years'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={1}
                                max={10}
                                value={years}
                                onChange={(e) =>
                                    setYears(Number(e.target.value))
                                }
                                className="w-full accent-emerald-500"
                            />
                        </div>

                        <div>
                            <div className="mb-1.5 flex justify-between text-xs">
                                <span className="font-semibold text-slate-400 uppercase">
                                    Expected Annual Return (CAGR)
                                </span>
                                <span className="font-mono font-bold text-cyan-400">
                                    {annualReturnPct}% / yr
                                </span>
                            </div>
                            <input
                                type="range"
                                min={5}
                                max={100}
                                value={annualReturnPct}
                                onChange={(e) =>
                                    setAnnualReturnPct(Number(e.target.value))
                                }
                                className="w-full accent-cyan-500"
                            />
                        </div>
                    </div>

                    {/* DCA Results & Visual Chart */}
                    <div className="flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-[#060a13] p-5 lg:col-span-8">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                <p className="text-xs text-slate-400">
                                    Total Principal Contributed
                                </p>
                                <p className="mt-1 font-mono text-xl font-bold text-white">
                                    {formatCurrency(
                                        dcaProjection.totalInvested,
                                    )}
                                </p>
                            </div>
                            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                <p className="text-xs text-slate-400">
                                    Compounded Market Profit
                                </p>
                                <p className="mt-1 font-mono text-xl font-bold text-emerald-400">
                                    +{formatCurrency(dcaProjection.totalProfit)}{' '}
                                    ({formatPercentage(dcaProjection.roiPct)})
                                </p>
                            </div>
                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                                <p className="text-xs text-emerald-300">
                                    Projected Portfolio Balance
                                </p>
                                <p className="mt-1 font-mono text-2xl font-extrabold text-white">
                                    {formatCurrency(dcaProjection.finalBalance)}
                                </p>
                            </div>
                        </div>

                        {/* Visual Bar Chart by Year */}
                        <div className="mt-6">
                            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                                    <TrendingUp
                                        size={14}
                                        className="text-emerald-400"
                                    />
                                    Year-by-Year Wealth Trajectory
                                </span>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5">
                                        <span className="size-2.5 rounded-sm bg-cyan-500" />
                                        Principal
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="size-2.5 rounded-sm bg-emerald-400" />
                                        Compounded Profit
                                    </span>
                                </div>
                            </div>

                            <div className="flex h-44 items-end gap-2.5 rounded-xl border border-white/[0.05] bg-black/30 p-4">
                                {dcaProjection.yearlyBreakdown.map((item) => {
                                    const maxVal =
                                        dcaProjection.finalBalance || 1;
                                    const totalHeightPct = Math.max(
                                        8,
                                        (item.totalValue / maxVal) * 100,
                                    );
                                    const investedSharePct =
                                        item.totalValue > 0
                                            ? (item.invested /
                                                  item.totalValue) *
                                              100
                                            : 100;

                                    return (
                                        <div
                                            key={item.year}
                                            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                                            title={`Year ${item.year}: Total ${formatCurrency(item.totalValue)} (Invested: ${formatCurrency(item.invested)})`}
                                        >
                                            <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">
                                                {formatCompactNumber(
                                                    item.totalValue,
                                                )}
                                            </span>
                                            <div
                                                style={{
                                                    height: `${totalHeightPct}%`,
                                                }}
                                                className="flex w-full max-w-[44px] flex-col justify-end overflow-hidden rounded-t-lg bg-emerald-400 transition-all"
                                            >
                                                <div
                                                    style={{
                                                        height: `${investedSharePct}%`,
                                                    }}
                                                    className="w-full bg-cyan-500"
                                                />
                                            </div>
                                            <span className="font-mono text-[11px] font-semibold text-slate-300">
                                                Y{item.year}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default CryptoLabClient;
