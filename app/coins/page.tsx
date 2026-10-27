import CoinsPagination from '@/components/CoinsPagination';
import CoinsScreenerClient from '@/components/CoinsScreenerClient';
import { fetcher } from '@/lib/coingecko.actions';

const Coins = async ({ searchParams }: NextPageProps) => {
    const { page } = await searchParams;

    const currentPage = Number(page) || 1;
    const perPage = 20;

    const coinsData = await fetcher<CoinMarketData[]>('/coins/markets', {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage,
        page: currentPage,
        sparkline: true,
        price_change_percentage: '24h,7d',
    }).catch(() => []);

    const hasMorePages = coinsData.length === perPage;

    const estimatedTotalPages =
        currentPage >= 100
            ? Math.ceil(currentPage / 100) * 100 + 100
            : 100;

    return (
        <main id="coins-page" className="main-container">
            <div className="content space-y-6">
                <CoinsScreenerClient
                    coins={coinsData}
                    currentPage={currentPage}
                />

                <CoinsPagination
                    currentPage={currentPage}
                    totalPages={estimatedTotalPages}
                    hasMorePages={hasMorePages}
                />
            </div>
        </main>
    );
};

export default Coins;
