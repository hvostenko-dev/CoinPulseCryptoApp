import {
    fetcher,
    getFearAndGreedIndex,
    getGlobalMarketData,
} from '@/lib/coingecko.actions';
import GlobalMarketBar from './GlobalMarketBar';

const GlobalMarketStrip = async () => {
    const [globalData, fearGreedList, tickerCoins] = await Promise.all([
        getGlobalMarketData(),
        getFearAndGreedIndex(),
        fetcher<CoinMarketData[]>(
            '/coins/markets',
            {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 12,
                page: 1,
                sparkline: false,
            },
            120,
        ).catch(() => []),
    ]);

    return (
        <GlobalMarketBar
            globalData={globalData}
            fearGreed={
                fearGreedList[0] ?? {
                    value: '72',
                    value_classification: 'Greed',
                    timestamp: String(Math.floor(Date.now() / 1000)),
                }
            }
            tickerCoins={tickerCoins}
        />
    );
};

export default GlobalMarketStrip;
