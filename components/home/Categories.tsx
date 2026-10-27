import { fetcher } from '@/lib/coingecko.actions';
import DataTable from '@/components/DataTable';
import Image from 'next/image';
import {
    cn,
    formatCompactNumber,
    formatPercentage,
} from '@/lib/utils';
import { Layers, TrendingDown, TrendingUp } from 'lucide-react';
import { CategoriesFallback } from './fallback';

const Categories = async () => {
    try {
        const categories = await fetcher<Category[]>('/coins/categories');

        const columns: DataTableColumn<Category>[] = [
            {
                header: 'Sector / Narrative',
                cellClassName: 'category-cell font-semibold text-white',
                cell: (category) => category.name,
            },
            {
                header: 'Ecosystem Leaders',
                cellClassName: 'top-gainers-cell',
                cell: (category) => (
                    <div className="flex items-center -space-x-1.5">
                        {category.top_3_coins
                            ?.filter(Boolean)
                            .map((coin, idx) => (
                                <Image
                                    src={coin}
                                    alt="Token icon"
                                    key={`${coin}-${idx}`}
                                    width={28}
                                    height={28}
                                    className="size-7 rounded-full border-2 border-[#0a101d] bg-slate-900"
                                />
                            ))}
                    </div>
                ),
            },
            {
                header: '24h Sector Flow',
                cellClassName: 'change-header-cell',
                cell: (category) => {
                    const change = category.market_cap_change_24h ?? 0;
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
                                <TrendingUp width={14} height={14} />
                            ) : (
                                <TrendingDown width={14} height={14} />
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
                header: 'Sector Market Cap',
                cellClassName: 'market-cap-cell font-mono text-slate-200',
                cell: (category) => formatCompactNumber(category.market_cap),
            },
            {
                header: '24h Volume',
                cellClassName: 'volume-cell font-mono text-slate-300',
                cell: (category) => formatCompactNumber(category.volume_24h),
            },
        ];

        return (
            <div
                id="categories"
                className="custom-scrollbar w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 pt-5 shadow-xl"
            >
                <div className="mb-3 flex items-center justify-between px-5">
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                            <Layers size={18} />
                        </span>
                        <div>
                            <h4 className="m-0! p-0! text-base font-bold text-white sm:text-lg">
                                Sector Rotation & Narrative Analytics
                            </h4>
                            <p className="text-xs text-slate-400">
                                Capital inflows across L1s, DeFi, AI, RWA, and
                                ecosystems
                            </p>
                        </div>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={categories?.slice(0, 10) ?? []}
                    rowKey={(_, index) => index}
                    tableClassName="mt-2"
                />
            </div>
        );
    } catch (error) {
        console.error('Error fetching categories:', error);
        return <CategoriesFallback />;
    }
};

export default Categories;
