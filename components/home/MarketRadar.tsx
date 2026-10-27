import {
    fetcher,
    getFearAndGreedIndex,
    getGlobalMarketData,
} from '@/lib/coingecko.actions';
import MarketRadarClient from './MarketRadarClient';

const MarketRadar = async () => {
    const [globalData, fearGreedList, marketCoins] = await Promise.all([
        getGlobalMarketData(),
        getFearAndGreedIndex(),
        fetcher<CoinMarketData[]>(
            '/coins/markets',
            {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 24,
                page: 1,
                sparkline: false,
                price_change_percentage: '24h',
            },
            120,
        ).catch(() => []),
    ]);

    return (
        <MarketRadarClient
            globalData={globalData}
            fearGreedList={fearGreedList}
            marketCoins={marketCoins}
        />
    );
};

export default MarketRadar;
