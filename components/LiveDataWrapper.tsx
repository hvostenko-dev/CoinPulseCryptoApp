'use client';

import CandlestickChart from '@/components/CandlestickChart';
import { useCoinGeckoWebSocket } from '@/hooks/useCoinGeckoWebSocket';
import DataTable from '@/components/DataTable';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { useState } from 'react';
import CoinHeader from '@/components/CoinHeader';
import { Activity } from 'lucide-react';

const LiveDataWrapper = ({
    coinId,
    poolId,
    coin,
    coinOHLCData,
}: LiveDataProps) => {
    const [liveInterval, setLiveInterval] = useState<'1s' | '1m'>('1s');
    const { trades, ohlcv, price } = useCoinGeckoWebSocket({
        coinId,
        poolId,
        liveInterval,
        fallbackBasePrice: coin.market_data.current_price.usd,
    });

    const tradeColumns: DataTableColumn<Trade>[] = [
        {
            header: 'Execution Price',
            cellClassName: 'price-cell font-mono text-white',
            cell: (trade) => (trade.price ? formatCurrency(trade.price) : '-'),
        },
        {
            header: `Size (${coin.symbol.toUpperCase()})`,
            cellClassName: 'amount-cell font-mono text-slate-200',
            cell: (trade) => trade.amount?.toFixed(4) ?? '-',
        },
        {
            header: 'Notional Value',
            cellClassName: 'value-cell font-mono text-slate-200',
            cell: (trade) => (trade.value ? formatCurrency(trade.value) : '-'),
        },
        {
            header: 'Side',
            cellClassName: 'type-cell',
            cell: (trade) => (
                <span
                    className={`inline-flex rounded-md px-2 py-0.5 font-mono text-xs font-bold ${
                        trade.type === 'b'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                    }`}
                >
                    {trade.type === 'b' ? 'BUY' : 'SELL'}
                </span>
            ),
        },
        {
            header: 'Time',
            cellClassName: 'time-cell font-mono text-xs text-slate-400',
            cell: (trade) =>
                trade.timestamp ? timeAgo(trade.timestamp) : '-',
        },
    ];

    return (
        <section id="live-data-wrapper" className="space-y-6">
            <CoinHeader
                coinId={coin.id}
                symbol={coin.symbol}
                name={coin.name}
                image={coin.image.large}
                livePrice={price?.usd ?? coin.market_data.current_price.usd}
                livePriceChangePercentage24h={
                    price?.change24h ??
                    coin.market_data.price_change_percentage_24h_in_currency.usd
                }
                priceChangePercentage30d={
                    coin.market_data.price_change_percentage_30d_in_currency.usd
                }
                priceChange24h={
                    coin.market_data.price_change_24h_in_currency.usd
                }
                high24h={coin.market_data.high_24h?.usd}
                low24h={coin.market_data.low_24h?.usd}
                marketCapRank={coin.market_cap_rank}
            />

            <div className="trend rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-4 shadow-xl sm:p-5">
                <CandlestickChart
                    coinId={coinId}
                    data={coinOHLCData}
                    liveOhlcv={ohlcv}
                    mode="live"
                    initialPeriod="daily"
                    liveInterval={liveInterval}
                    setLiveInterval={setLiveInterval}
                >
                    <div className="flex items-center gap-2">
                        <Activity size={18} className="text-emerald-400" />
                        <h4 className="m-0! p-0! text-base font-bold text-white sm:text-lg">
                            Interactive OHLCV Terminal
                        </h4>
                    </div>
                </CandlestickChart>
            </div>

            {tradeColumns && (
                <div className="trades rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-xl">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h4 className="m-0! text-base font-bold text-white sm:text-lg">
                                Live Orderflow & Trade Tape
                            </h4>
                            <p className="text-xs text-slate-400">
                                Real-time market executions & liquidity stream
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-300">
                            <span className="size-1.5 animate-ping rounded-full bg-emerald-400" />
                            LIVE ORDERFLOW
                        </span>
                    </div>

                    <DataTable
                        columns={tradeColumns}
                        data={trades}
                        rowKey={(_, index) => index}
                        tableClassName="trades-table mt-2!"
                    />
                </div>
            )}
        </section>
    );
};

export default LiveDataWrapper;
