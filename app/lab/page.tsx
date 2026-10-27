import CryptoLabClient from '@/components/CryptoLabClient';
import { fetcher } from '@/lib/coingecko.actions';

export default async function CryptoLabPage() {
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

    return <CryptoLabClient marketCoins={marketCoins} />;
}
