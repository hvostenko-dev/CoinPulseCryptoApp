import { fetcher } from '@/lib/coingecko.actions';
import Link from 'next/link';
import Image from 'next/image';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { Flame, TrendingDown, TrendingUp } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { TrendingCoinsFallback } from './fallback';

const TrendingCoins = async () => {
    let trendingCoins;

    try {
        trendingCoins = await fetcher<{ coins: TrendingCoin[] }>(
            '/search/trending',
            undefined,
            300,
        );
    } catch (error) {
        console.error('Error fetching trending coins:', error);
        return <TrendingCoinsFallback />;
    }

    const columns: DataTableColumn<TrendingCoin>[] = [
        {
            header: 'Asset',
            cellClassName: 'name-cell',
            cell: (coin) => {
                const item = coin.item;

                return (
                    <Link
                        href={`/coins/${item.id}`}
                        className="group flex items-center gap-2.5 py-1"
                    >
                        <Image
                            src={item.large}
                            alt={item.name}
                            width={34}
                            height={34}
                            className="rounded-full border border-white/10"
                        />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white group-hover:text-emerald-300">
                                {item.name}
                            </p>
                            <span className="font-mono text-[11px] text-slate-400 uppercase">
                                {item.symbol}{' '}
                                {item.market_cap_rank
                                    ? `• #${item.market_cap_rank}`
                                    : ''}
                            </span>
                        </div>
                    </Link>
                );
            },
        },
        {
            header: '24h %',
            cellClassName: 'change-cell',
            cell: (coin) => {
                const item = coin.item;
                const change = item.data.price_change_percentage_24h.usd ?? 0;
                const isTrendingUp = change >= 0;

                return (
                    <div
                        className={cn(
                            'inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-bold',
                            isTrendingUp
                                ? 'bg-emerald-500/12 text-emerald-400'
                                : 'bg-rose-500/12 text-rose-400',
                        )}
                    >
                        {isTrendingUp ? (
                            <TrendingUp width={13} height={13} />
                        ) : (
                            <TrendingDown width={13} height={13} />
                        )}
                        <span>
                            {isTrendingUp ? '+' : ''}
                            {formatPercentage(change)}
                        </span>
                    </div>
                );
            },
        },
        {
            header: 'Price',
            cellClassName: 'price-cell font-mono text-right',
            headClassName: 'text-right',
            cell: (coin) => formatCurrency(coin.item.data.price),
        },
    ];

    return (
        <div
            id="trending-coins"
            className="flex h-full w-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-4 shadow-xl sm:p-5"
        >
            <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                        <Flame size={17} />
                    </span>
                    <div>
                        <h4 className="text-base font-bold text-white sm:text-lg">
                            Trending Search Pulse
                        </h4>
                        <p className="text-[11px] text-slate-400">
                            Most searched assets in the last 24h
                        </p>
                    </div>
                </div>
                <Link
                    href="/coins"
                    className="font-mono text-xs font-semibold text-emerald-400 hover:underline"
                >
                    View All →
                </Link>
            </div>

            <DataTable
                data={trendingCoins.coins.slice(0, 6) || []}
                columns={columns}
                rowKey={(coin) => coin.item.id}
                tableClassName="trending-coins-table"
                headerCellClassName="py-2.5! text-xs uppercase tracking-wider"
                bodyCellClassName="py-2.5!"
            />
        </div>
    );
};

export default TrendingCoins;
