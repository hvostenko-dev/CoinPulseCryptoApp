import WatchlistClient from '@/components/WatchlistClient';
import { fetcher } from '@/lib/coingecko.actions';

export default async function WatchlistPage() {
    const marketCoins = await fetcher<CoinMarketData[]>(
        '/coins/markets',
        {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 50,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h',
        },
        120,
    ).catch(() => []);

    return <WatchlistClient marketCoins={marketCoins} />;
}
