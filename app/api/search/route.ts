import {
    NextRequest,
    NextResponse,
} from 'next/server';

interface CoinGeckoSearchCoin {
    id: string;
    name: string;
    symbol: string;
    market_cap_rank: number | null;
    thumb: string;
}

interface CoinGeckoSearchResponse {
    coins?: CoinGeckoSearchCoin[];
}

const FALLBACK_SEARCH_COINS: CoinGeckoSearchCoin[] = [
    {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        market_cap_rank: 1,
        thumb: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png',
    },
    {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        market_cap_rank: 2,
        thumb: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png',
    },
    {
        id: 'tether',
        name: 'Tether',
        symbol: 'USDT',
        market_cap_rank: 3,
        thumb: 'https://coin-images.coingecko.com/coins/images/325/large/Tether.png',
    },
    {
        id: 'solana',
        name: 'Solana',
        symbol: 'SOL',
        market_cap_rank: 4,
        thumb: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png',
    },
    {
        id: 'binancecoin',
        name: 'BNB',
        symbol: 'BNB',
        market_cap_rank: 5,
        thumb: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    },
    {
        id: 'ripple',
        name: 'XRP',
        symbol: 'XRP',
        market_cap_rank: 6,
        thumb: 'https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    },
    {
        id: 'dogecoin',
        name: 'Dogecoin',
        symbol: 'DOGE',
        market_cap_rank: 7,
        thumb: 'https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png',
    },
    {
        id: 'cardano',
        name: 'Cardano',
        symbol: 'ADA',
        market_cap_rank: 8,
        thumb: 'https://coin-images.coingecko.com/coins/images/975/large/cardano.png',
    },
    {
        id: 'chainlink',
        name: 'Chainlink',
        symbol: 'LINK',
        market_cap_rank: 9,
        thumb: 'https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    },
    {
        id: 'sui',
        name: 'Sui',
        symbol: 'SUI',
        market_cap_rank: 10,
        thumb: 'https://coin-images.coingecko.com/coins/images/26375/large/sui-ocean-square.png',
    },
    {
        id: 'avalanche-2',
        name: 'Avalanche',
        symbol: 'AVAX',
        market_cap_rank: 11,
        thumb: 'https://coin-images.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    },
    {
        id: 'polkadot',
        name: 'Polkadot',
        symbol: 'DOT',
        market_cap_rank: 12,
        thumb: 'https://coin-images.coingecko.com/coins/images/12171/large/polkadot.png',
    },
];

function getLocalFallbackMatches(query: string): CoinGeckoSearchCoin[] {
    const q = query.toLowerCase();
    return FALLBACK_SEARCH_COINS.filter(
        (coin) =>
            coin.name.toLowerCase().includes(q) ||
            coin.symbol.toLowerCase().includes(q) ||
            coin.id.toLowerCase().includes(q),
    );
}

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';

    if (query.length < 2) {
        return NextResponse.json({
            coins: [],
        });
    }

    const rawBaseUrl =
        process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';
    const apiKey = process.env.COINGECKO_API_KEY || '';

    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const url = new URL(`${baseUrl}/search`);
    url.searchParams.set('query', query);

    const headers: Record<string, string> = {
        Accept: 'application/json',
    };
    if (apiKey) {
        headers['x-cg-demo-api-key'] = apiKey;
    }

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers,
            signal: AbortSignal.timeout(6000),
            next: {
                revalidate: 30,
            },
        });

        if (!response.ok) {
            return NextResponse.json({
                coins: getLocalFallbackMatches(query),
            });
        }

        const data = (await response.json()) as CoinGeckoSearchResponse;

        return NextResponse.json({
            coins: Array.isArray(data.coins)
                ? data.coins.slice(0, 10)
                : getLocalFallbackMatches(query),
        });
    } catch {
        return NextResponse.json({
            coins: getLocalFallbackMatches(query),
        });
    }
}
