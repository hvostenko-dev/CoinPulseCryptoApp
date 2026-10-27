import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Layers } from 'lucide-react';

import { fetcher, getPools } from '@/lib/coingecko.actions';
import {
    formatCompactNumber,
    formatCurrency,
    formatPercentage,
} from '@/lib/utils';

import LiveDataWrapper from '@/components/LiveDataWrapper';
import Converter from '@/components/Converter';

const getNetworkFromGeckoTerminalUrl = (
    geckoTerminalUrl?: string | null,
): string | null => {
    if (!geckoTerminalUrl) {
        return null;
    }

    try {
        const url = new URL(geckoTerminalUrl);

        const pathnameParts = url.pathname.split('/').filter(Boolean);

        const networksIndex = pathnameParts.indexOf('networks');

        if (networksIndex !== -1 && pathnameParts[networksIndex + 1]) {
            return pathnameParts[networksIndex + 1];
        }

        return pathnameParts[0] ?? null;
    } catch {
        return null;
    }
};

const Page = async ({ params }: NextPageProps) => {
    const { id } = await params;

    const [coinData, coinOHLCData] = await Promise.all([
        fetcher<CoinDetailsData>(`/coins/${id}`, {
            dex_pair_format: 'contract_address',
        }),

        fetcher<OHLCData[]>(`/coins/${id}/ohlc`, {
            vs_currency: 'usd',
            days: 1,
            precision: 'full',
        }).catch(() => []),
    ]);

    const platform = coinData.asset_platform_id
        ? coinData.detail_platforms?.[coinData.asset_platform_id]
        : null;

    const network = getNetworkFromGeckoTerminalUrl(
        platform?.geckoterminal_url,
    );

    const contractAddress = platform?.contract_address ?? null;

    const pool =
        network && contractAddress
            ? await getPools(id, network, contractAddress)
            : null;

    const poolId = pool?.id ?? '';

    const circulating = coinData.market_data?.circulating_supply ?? 0;
    const maxSupply =
        coinData.market_data?.max_supply ??
        coinData.market_data?.total_supply ??
        0;
    const supplyPct =
        maxSupply > 0 ? Math.min(100, (circulating / maxSupply) * 100) : null;

    const mcapUsd = coinData.market_data?.market_cap?.usd ?? 0;
    const fdvUsd =
        coinData.market_data?.fully_diluted_valuation?.usd ?? mcapUsd;
    const volUsd = coinData.market_data?.total_volume?.usd ?? 0;
    const athUsd = coinData.market_data?.ath?.usd;

    const coinDetails = [
        {
            label: 'Market Cap',
            value: formatCompactNumber(mcapUsd),
        },
        {
            label: 'Fully Diluted (FDV)',
            value: formatCompactNumber(fdvUsd),
        },
        {
            label: '24h Trading Volume',
            value: formatCompactNumber(volUsd),
        },
        {
            label: 'All-Time High (ATH)',
            value: athUsd
                ? `${formatCurrency(athUsd)} (${formatPercentage(
                      coinData.market_data?.ath_change_percentage?.usd ?? 0,
                  )})`
                : 'N/A',
        },
        {
            label: 'Circulating Supply',
            value: `${formatCompactNumber(circulating, false)} ${coinData.symbol.toUpperCase()}`,
        },
        {
            label: 'Official Website',
            value: '-',
            link:
                coinData.links?.homepage?.find(
                    (homepage) => homepage && homepage.length > 0,
                ) ?? '',
            linkText: 'Visit Website',
        },
        {
            label: 'Block Explorer',
            value: '-',
            link:
                coinData.links?.blockchain_site?.find(
                    (blockchainSite) =>
                        blockchainSite && blockchainSite.length > 0,
                ) ?? '',
            linkText: 'On-Chain Explorer',
        },
        {
            label: 'Community Hub',
            value: '-',
            link: coinData.links?.subreddit_url ?? '',
            linkText: 'Reddit / Forum',
        },
    ];

    return (
        <div className="mx-auto max-w-360 px-4 py-6 sm:px-6">
            <div className="mb-4 flex items-center justify-between">
                <Link
                    href="/coins"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:text-white"
                >
                    <ArrowLeft size={15} />
                    <span>Back to Screener</span>
                </Link>

                <Link
                    href="/lab"
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-cyan-400 hover:underline"
                >
                    <span>
                        Compare {coinData.symbol.toUpperCase()} in Lab →
                    </span>
                </Link>
            </div>

            <main
                id="coin-details-page"
                className="grid grid-cols-1 items-start gap-6 p-0! xl:grid-cols-3"
            >
                <section className="primary xl:col-span-2">
                    <LiveDataWrapper
                        coinId={id}
                        poolId={poolId}
                        coin={coinData}
                        coinOHLCData={coinOHLCData}
                    />
                </section>

                <section className="secondary space-y-6 lg:col-span-1">
                    <Converter
                        symbol={coinData.symbol}
                        icon={
                            coinData.image?.small ||
                            coinData.image?.large ||
                            ''
                        }
                        priceList={
                            coinData.market_data?.current_price ?? { usd: 0 }
                        }
                    />

                    {/* Supply Progress Card */}
                    {supplyPct !== null && (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-xl">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-300 uppercase">
                                    <Layers
                                        size={14}
                                        className="text-emerald-400"
                                    />
                                    Token Supply Issuance
                                </span>
                                <span className="font-mono text-xs font-bold text-emerald-400">
                                    {supplyPct.toFixed(1)}% Unlocked
                                </span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                                <div
                                    style={{ width: `${supplyPct}%` }}
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                                />
                            </div>
                            <div className="mt-2 flex justify-between font-mono text-[11px] text-slate-400">
                                <span>
                                    Circ:{' '}
                                    {formatCompactNumber(circulating, false)}
                                </span>
                                <span>
                                    Max: {formatCompactNumber(maxSupply, false)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="details rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-xl">
                        <h4 className="mb-4 text-lg font-bold text-white">
                            On-Chain & Fundamental Telemetry
                        </h4>

                        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {coinDetails.map(
                                ({ label, value, link, linkText }, index) => (
                                    <li
                                        key={`${label}-${index}`}
                                        className="flex flex-col justify-between rounded-xl border border-white/[0.06] bg-black/25 p-3.5"
                                    >
                                        <p className="text-xs text-slate-400">
                                            {label}
                                        </p>

                                        {link ? (
                                            <div className="mt-1.5 flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 hover:underline">
                                                <Link
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {linkText || label}
                                                </Link>
                                                <ArrowUpRight size={14} />
                                            </div>
                                        ) : (
                                            <p className="mt-1.5 font-mono text-sm font-bold text-white">
                                                {value}
                                            </p>
                                        )}
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Page;
