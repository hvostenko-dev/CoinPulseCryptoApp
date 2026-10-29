'use server';

import qs from 'query-string';

type CoinGeckoQueryValue =
    | string
    | number
    | boolean
    | string[]
    | number[]
    | boolean[]
    | null
    | undefined;

type CoinGeckoQueryParams = Record<string, CoinGeckoQueryValue>;

interface CoinGeckoStatusPayload {
    error_code?: number;
    error_message?: string;
}

interface CoinGeckoApiError {
    error?: string | { status?: CoinGeckoStatusPayload };
    error_code?: number;
    error_message?: string;
    status?: CoinGeckoStatusPayload;
}

const rawBaseUrl =
    process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';
const rawApiKey = process.env.COINGECKO_API_KEY || '';

const BASE_URL: string = rawBaseUrl.replace(/\/+$/, '');
const API_KEY: string = rawApiKey;

const FALLBACK_COINS: CoinMarketData[] = [
    {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png',
        current_price: 94250,
        market_cap: 1865000000000,
        market_cap_rank: 1,
        fully_diluted_valuation: 1979000000000,
        total_volume: 46800000000,
        high_24h: 95400,
        low_24h: 91800,
        price_change_24h: 2140,
        price_change_percentage_24h: 2.32,
        price_change_percentage_7d_in_currency: 6.45,
        market_cap_change_24h: 41000000000,
        market_cap_change_percentage_24h: 2.25,
        circulating_supply: 19785000,
        total_supply: 21000000,
        max_supply: 21000000,
        ath: 108786,
        ath_change_percentage: -13.36,
        ath_date: '2025-01-20T00:00:00.000Z',
        atl: 67.81,
        atl_change_percentage: 138890,
        atl_date: '2013-07-06T00:00:00.000Z',
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
            price: [88500, 89200, 90400, 89900, 91600, 92800, 93500, 94250],
        },
    },
    {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        image: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png',
        current_price: 3180,
        market_cap: 382900000000,
        market_cap_rank: 2,
        fully_diluted_valuation: 382900000000,
        total_volume: 24100000000,
        high_24h: 3245,
        low_24h: 3060,
        price_change_24h: 98.4,
        price_change_percentage_24h: 3.19,
        price_change_percentage_7d_in_currency: 8.12,
        market_cap_change_24h: 11800000000,
        market_cap_change_percentage_24h: 3.18,
        circulating_supply: 120420000,
        total_supply: 120420000,
        max_supply: 0,
        ath: 4878,
        ath_change_percentage: -34.8,
        ath_date: '2021-11-10T00:00:00.000Z',
        atl: 0.432979,
        atl_change_percentage: 734300,
        atl_date: '2015-10-20T00:00:00.000Z',
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
            price: [2940, 2980, 3010, 3055, 3090, 3120, 3155, 3180],
        },
    },
    {
        id: 'tether',
        symbol: 'usdt',
        name: 'Tether',
        image: 'https://coin-images.coingecko.com/coins/images/325/large/Tether.png',
        current_price: 1.0,
        market_cap: 138000000000,
        market_cap_rank: 3,
        fully_diluted_valuation: 138000000000,
        total_volume: 68500000000,
        high_24h: 1.001,
        low_24h: 0.999,
        price_change_24h: 0.0001,
        price_change_percentage_24h: 0.01,
        price_change_percentage_7d_in_currency: 0.02,
        market_cap_change_24h: 120000000,
        market_cap_change_percentage_24h: 0.09,
        circulating_supply: 138000000000,
        total_supply: 138000000000,
        max_supply: 0,
        ath: 1.32,
        ath_change_percentage: -24.4,
        ath_date: '2018-07-24T00:00:00.000Z',
        atl: 0.572521,
        atl_change_percentage: 74.6,
        atl_date: '2015-03-02T00:00:00.000Z',
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
            price: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
        },
    },
    {
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        image: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png',
        current_price: 212.4,
        market_cap: 101800000000,
        market_cap_rank: 4,
        fully_diluted_valuation: 125400000000,
        total_volume: 7940000000,
        high_24h: 216.8,
        low_24h: 199.5,
        price_change_24h: 11.2,
        price_change_percentage_24h: 5.57,
        price_change_percentage_7d_in_currency: 14.3,
        market_cap_change_24h: 5300000000,
        market_cap_change_percentage_24h: 5.49,
        circulating_supply: 479200000,
        total_supply: 590400000,
        max_supply: 0,
        ath: 293.31,
        ath_change_percentage: -27.58,
        ath_date: '2025-01-19T00:00:00.000Z',
        atl: 0.500801,
        atl_change_percentage: 42312,
        atl_date: '2020-05-11T00:00:00.000Z',
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
            price: [186, 190, 194, 198, 203, 207, 210, 212.4],
        },
    },
    {
        id: 'binancecoin',
        symbol: 'bnb',
        name: 'BNB',
        image: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
        current_price: 658.2,
        market_cap: 94800000000,
        market_cap_rank: 5,
        fully_diluted_valuation: 94800000000,
        total_volume: 1920000000,
        high_24h: 665.0,
        low_24h: 642.1,
        price_change_24h: 11.4,
        price_change_percentage_24h: 1.76,
        price_change_percentage_7d_in_currency: 4.15,
        market_cap_change_24h: 1640000000,
        market_cap_change_percentage_24h: 1.76,
        circulating_supply: 144000000,
        total_supply: 144000000,
        max_supply: 200000000,
        ath: 788.84,
        ath_change_percentage: -16.56,
        ath_date: '2024-12-04T00:00:00.000Z',
        atl: 0.0398177,
        atl_change_percentage: 1652900,
        atl_date: '2017-10-19T00:00:00.000Z',
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
            price: [632, 636, 640, 645, 649, 652, 655, 658.2],
        },
    },
    {
        id: 'ripple',
        symbol: 'xrp',
        name: 'XRP',
        image: 'https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
        current_price: 2.48,
        market_cap: 142500000000,
        market_cap_rank: 6,
        fully_diluted_valuation: 248000000000,
        total_volume: 6400000000,
        high_24h: 2.56,
        low_24h: 2.35,
        price_change_24h: 0.09,
        price_change_percentage_24h: 3.77,
        price_change_percentage_7d_in_currency: 11.2,
        market_cap_change_24h: 5100000000,
        market_cap_change_percentage_24h: 3.71,
        circulating_supply: 57450000000,
        total_supply: 99987000000,
        max_supply: 100000000000,
        ath: 3.4,
        ath_change_percentage: -27.06,
        ath_date: '2018-01-07T00:00:00.000Z',
        atl: 0.00268621,
        atl_change_percentage: 92220,
        atl_date: '2014-05-22T00:00:00.000Z',
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
            price: [2.23, 2.27, 2.31, 2.34, 2.39, 2.42, 2.45, 2.48],
        },
    },
    {
        id: 'dogecoin',
        symbol: 'doge',
        name: 'Dogecoin',
        image: 'https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png',
        current_price: 0.284,
        market_cap: 41800000000,
        market_cap_rank: 7,
        fully_diluted_valuation: 41800000000,
        total_volume: 3120000000,
        high_24h: 0.295,
        low_24h: 0.271,
        price_change_24h: -0.0042,
        price_change_percentage_24h: -1.46,
        price_change_percentage_7d_in_currency: 5.8,
        market_cap_change_24h: -610000000,
        market_cap_change_percentage_24h: -1.44,
        circulating_supply: 147200000000,
        total_supply: 147200000000,
        max_supply: 0,
        ath: 0.731578,
        ath_change_percentage: -61.18,
        ath_date: '2021-05-08T00:00:00.000Z',
        atl: 0.0000869,
        atl_change_percentage: 326700,
        atl_date: '2015-05-06T00:00:00.000Z',
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
            price: [0.268, 0.274, 0.281, 0.289, 0.287, 0.285, 0.286, 0.284],
        },
    },
    {
        id: 'cardano',
        symbol: 'ada',
        name: 'Cardano',
        image: 'https://coin-images.coingecko.com/coins/images/975/large/cardano.png',
        current_price: 0.942,
        market_cap: 33700000000,
        market_cap_rank: 8,
        fully_diluted_valuation: 42390000000,
        total_volume: 1180000000,
        high_24h: 0.968,
        low_24h: 0.915,
        price_change_24h: 0.018,
        price_change_percentage_24h: 1.95,
        price_change_percentage_7d_in_currency: 4.9,
        market_cap_change_24h: 640000000,
        market_cap_change_percentage_24h: 1.94,
        circulating_supply: 35780000000,
        total_supply: 45000000000,
        max_supply: 45000000000,
        ath: 3.09,
        ath_change_percentage: -69.5,
        ath_date: '2021-09-02T00:00:00.000Z',
        atl: 0.01925275,
        atl_change_percentage: 4792,
        atl_date: '2020-03-13T00:00:00.000Z',
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
            price: [0.898, 0.905, 0.912, 0.92, 0.928, 0.934, 0.939, 0.942],
        },
    },
    {
        id: 'chainlink',
        symbol: 'link',
        name: 'Chainlink',
        image: 'https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
        current_price: 21.85,
        market_cap: 13800000000,
        market_cap_rank: 9,
        fully_diluted_valuation: 21850000000,
        total_volume: 890000000,
        high_24h: 22.4,
        low_24h: 20.3,
        price_change_24h: 1.32,
        price_change_percentage_24h: 6.43,
        price_change_percentage_7d_in_currency: 16.8,
        market_cap_change_24h: 830000000,
        market_cap_change_percentage_24h: 6.4,
        circulating_supply: 631000000,
        total_supply: 1000000000,
        max_supply: 1000000000,
        ath: 52.7,
        ath_change_percentage: -58.5,
        ath_date: '2021-05-10T00:00:00.000Z',
        atl: 0.148183,
        atl_change_percentage: 14645,
        atl_date: '2017-11-29T00:00:00.000Z',
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
            price: [18.7, 19.2, 19.8, 20.1, 20.6, 21.1, 21.5, 21.85],
        },
    },
    {
        id: 'sui',
        symbol: 'sui',
        name: 'Sui',
        image: 'https://coin-images.coingecko.com/coins/images/26375/large/sui-ocean-square.png',
        current_price: 3.92,
        market_cap: 11400000000,
        market_cap_rank: 10,
        fully_diluted_valuation: 39200000000,
        total_volume: 1640000000,
        high_24h: 4.08,
        low_24h: 3.62,
        price_change_24h: 0.27,
        price_change_percentage_24h: 7.4,
        price_change_percentage_7d_in_currency: 19.5,
        market_cap_change_24h: 785000000,
        market_cap_change_percentage_24h: 7.39,
        circulating_supply: 2920000000,
        total_supply: 10000000000,
        max_supply: 10000000000,
        ath: 5.35,
        ath_change_percentage: -26.7,
        ath_date: '2025-01-04T00:00:00.000Z',
        atl: 0.364846,
        atl_change_percentage: 974.4,
        atl_date: '2023-10-19T00:00:00.000Z',
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
            price: [3.28, 3.36, 3.45, 3.58, 3.67, 3.78, 3.85, 3.92],
        },
    },
    {
        id: 'avalanche-2',
        symbol: 'avax',
        name: 'Avalanche',
        image: 'https://coin-images.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
        current_price: 36.4,
        market_cap: 14900000000,
        market_cap_rank: 11,
        fully_diluted_valuation: 26100000000,
        total_volume: 720000000,
        high_24h: 37.8,
        low_24h: 35.9,
        price_change_24h: -0.82,
        price_change_percentage_24h: -2.2,
        price_change_percentage_7d_in_currency: 3.4,
        market_cap_change_24h: -335000000,
        market_cap_change_percentage_24h: -2.2,
        circulating_supply: 409000000,
        total_supply: 447000000,
        max_supply: 720000000,
        ath: 144.96,
        ath_change_percentage: -74.89,
        ath_date: '2021-11-21T00:00:00.000Z',
        atl: 2.8,
        atl_change_percentage: 1200,
        atl_date: '2020-12-31T00:00:00.000Z',
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
            price: [35.2, 35.8, 36.5, 37.1, 36.9, 36.7, 36.6, 36.4],
        },
    },
    {
        id: 'polkadot',
        symbol: 'dot',
        name: 'Polkadot',
        image: 'https://coin-images.coingecko.com/coins/images/12171/large/polkadot.png',
        current_price: 6.85,
        market_cap: 10400000000,
        market_cap_rank: 12,
        fully_diluted_valuation: 10400000000,
        total_volume: 410000000,
        high_24h: 7.12,
        low_24h: 6.75,
        price_change_24h: -0.19,
        price_change_percentage_24h: -2.7,
        price_change_percentage_7d_in_currency: 1.9,
        market_cap_change_24h: -288000000,
        market_cap_change_percentage_24h: -2.7,
        circulating_supply: 1520000000,
        total_supply: 1520000000,
        max_supply: 0,
        ath: 54.98,
        ath_change_percentage: -87.54,
        ath_date: '2021-11-04T00:00:00.000Z',
        atl: 2.7,
        atl_change_percentage: 153.7,
        atl_date: '2020-08-20T00:00:00.000Z',
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
            price: [6.72, 6.8, 6.95, 7.04, 6.98, 6.92, 6.89, 6.85],
        },
    },
];

function buildFallbackOhlc(basePrice = 94250): OHLCData[] {
    const nowSec = Math.floor(Date.now() / 1000);
    const step = 3600;
    const candles: OHLCData[] = [];
    let price = basePrice * 0.965;

    for (let i = 36; i >= 0; i--) {
        const ts = (nowSec - i * step) * 1000;
        const delta = Math.sin(i * 0.45) * (basePrice * 0.0045);
        const open = Number(price.toFixed(2));
        const close = Number(
            Math.max(basePrice * 0.5, open + delta + basePrice * 0.001).toFixed(
                2,
            ),
        );
        const high = Number(
            (Math.max(open, close) + basePrice * 0.0028).toFixed(2),
        );
        const low = Number(
            (Math.min(open, close) - basePrice * 0.0024).toFixed(2),
        );
        candles.push([ts, open, high, low, close]);
        price = close;
    }

    return candles;
}

function buildFallbackCoinDetails(coinId: string): CoinDetailsData {
    const match =
        FALLBACK_COINS.find((c) => c.id === coinId) ?? FALLBACK_COINS[0];

    return {
        id: match.id,
        name: match.name,
        symbol: match.symbol,
        asset_platform_id: null,
        image: {
            large: match.image,
            small: match.image,
        },
        market_data: {
            current_price: {
                usd: match.current_price,
                eur: Number((match.current_price * 0.92).toFixed(2)),
                gbp: Number((match.current_price * 0.79).toFixed(2)),
            },
            high_24h: { usd: match.high_24h },
            low_24h: { usd: match.low_24h },
            ath: { usd: match.ath },
            ath_change_percentage: { usd: match.ath_change_percentage },
            atl: { usd: match.atl },
            circulating_supply: match.circulating_supply,
            total_supply: match.total_supply,
            max_supply: match.max_supply || null,
            fully_diluted_valuation: { usd: match.fully_diluted_valuation },
            price_change_24h_in_currency: { usd: match.price_change_24h },
            price_change_percentage_24h_in_currency: {
                usd: match.price_change_percentage_24h,
            },
            price_change_percentage_7d_in_currency: {
                usd: match.price_change_percentage_7d_in_currency ?? 4.2,
            },
            price_change_percentage_30d_in_currency: {
                usd: (match.price_change_percentage_24h || 2) * 3.8,
            },
            market_cap: { usd: match.market_cap },
            total_volume: { usd: match.total_volume },
        },
        market_cap_rank: match.market_cap_rank,
        description: {
            en: `${match.name} institutional market feed.`,
        },
        links: {
            homepage: ['https://www.coingecko.com'],
            blockchain_site: ['https://www.coingecko.com'],
            subreddit_url: 'https://www.reddit.com',
        },
        tickers: [],
    };
}

function getFallbackResponse(endpoint: string): unknown {
    if (endpoint === '/coins/markets') {
        return FALLBACK_COINS;
    }

    if (endpoint === '/search/trending') {
        return {
            coins: FALLBACK_COINS.slice(0, 6).map((c) => ({
                item: {
                    id: c.id,
                    name: c.name,
                    symbol: c.symbol.toUpperCase(),
                    market_cap_rank: c.market_cap_rank,
                    thumb: c.image,
                    large: c.image,
                    data: {
                        price: c.current_price,
                        price_change_percentage_24h: {
                            usd: c.price_change_percentage_24h,
                        },
                    },
                },
            })),
        };
    }

    if (endpoint === '/coins/categories') {
        return [
            {
                name: 'Layer 1 (L1)',
                top_3_coins: [
                    FALLBACK_COINS[0].image,
                    FALLBACK_COINS[1].image,
                    FALLBACK_COINS[3].image,
                ],
                market_cap_change_24h: 3.14,
                market_cap: 2490000000000,
                volume_24h: 89400000000,
            },
            {
                name: 'Decentralized Finance (DeFi)',
                top_3_coins: [
                    FALLBACK_COINS[8].image,
                    FALLBACK_COINS[9].image,
                    FALLBACK_COINS[10].image,
                ],
                market_cap_change_24h: 4.82,
                market_cap: 118500000000,
                volume_24h: 9850000000,
            },
            {
                name: 'Real World Assets (RWA)',
                top_3_coins: [
                    FALLBACK_COINS[8].image,
                    FALLBACK_COINS[5].image,
                    FALLBACK_COINS[10].image,
                ],
                market_cap_change_24h: 6.15,
                market_cap: 42300000000,
                volume_24h: 3650000000,
            },
            {
                name: 'Artificial Intelligence (AI)',
                top_3_coins: [
                    FALLBACK_COINS[3].image,
                    FALLBACK_COINS[9].image,
                    FALLBACK_COINS[8].image,
                ],
                market_cap_change_24h: 5.4,
                market_cap: 38900000000,
                volume_24h: 4120000000,
            },
            {
                name: 'Smart Contract Platforms',
                top_3_coins: [
                    FALLBACK_COINS[1].image,
                    FALLBACK_COINS[3].image,
                    FALLBACK_COINS[4].image,
                ],
                market_cap_change_24h: 2.95,
                market_cap: 765000000000,
                volume_24h: 41200000000,
            },
        ] satisfies Category[];
    }

    if (endpoint.endsWith('/ohlc')) {
        const parts = endpoint.split('/').filter(Boolean);
        const coinId = parts[1] || 'bitcoin';
        const match = FALLBACK_COINS.find((c) => c.id === coinId);
        return buildFallbackOhlc(match?.current_price ?? 94250);
    }

    if (endpoint.startsWith('/coins/')) {
        const parts = endpoint.split('/').filter(Boolean);
        const coinId = parts[1] || 'bitcoin';
        return buildFallbackCoinDetails(coinId);
    }

    return null;
}

export async function fetcher<T>(
    endpoint: string,
    params: CoinGeckoQueryParams = {},
    revalidate = 60,
): Promise<T> {
    const normalizedEndpoint = endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`;

    // CoinGecko Demo API restricts /ohlc days='max' (401 Unauthorized); clamp to 365
    const safeParams: CoinGeckoQueryParams = { ...params };
    if (normalizedEndpoint.endsWith('/ohlc') && safeParams.days === 'max') {
        safeParams.days = 365;
    }

    const url = qs.stringifyUrl(
        {
            url: `${BASE_URL}${normalizedEndpoint}`,
            query: safeParams,
        },
        {
            skipEmptyString: true,
            skipNull: true,
            arrayFormat: 'comma',
        },
    );

    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    if (API_KEY) {
        headers['x-cg-demo-api-key'] = API_KEY;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers,
            signal: AbortSignal.timeout(7500),
            next: {
                revalidate,
            },
        });

        const responseText = await response.text();

        let responseBody: unknown = null;

        if (responseText) {
            try {
                responseBody = JSON.parse(responseText);
            } catch {
                responseBody = responseText;
            }
        }

        if (!response.ok) {
            const fallback = getFallbackResponse(normalizedEndpoint);
            if (fallback !== null) {
                return fallback as T;
            }

            const errorBody =
                typeof responseBody === 'object' && responseBody !== null
                    ? (responseBody as CoinGeckoApiError)
                    : null;

            const nestedErrorObj =
                typeof errorBody?.error === 'object' &&
                errorBody.error !== null
                    ? errorBody.error.status
                    : null;

            const errorMessage =
                errorBody?.status?.error_message ??
                nestedErrorObj?.error_message ??
                errorBody?.error_message ??
                (typeof errorBody?.error === 'string'
                    ? errorBody.error
                    : null) ??
                responseText ??
                response.statusText;

            const errorCode =
                errorBody?.status?.error_code ??
                nestedErrorObj?.error_code ??
                errorBody?.error_code;

            throw new Error(
                `CoinGecko API Error ${response.status}${
                    errorCode ? ` (${errorCode})` : ''
                }: ${errorMessage}`,
            );
        }

        return responseBody as T;
    } catch (err) {
        const fallback = getFallbackResponse(normalizedEndpoint);
        if (fallback !== null) {
            return fallback as T;
        }
        throw err;
    }
}

export async function getGlobalMarketData(): Promise<
    GlobalMarketResponse['data']
> {
    const fallbackGlobal: GlobalMarketResponse['data'] = {
        active_cryptocurrencies: 16842,
        markets: 1195,
        total_market_cap: { usd: 3_420_000_000_000 },
        total_volume: { usd: 148_500_000_000 },
        market_cap_percentage: { btc: 56.4, eth: 13.2, sol: 4.1, usdt: 4.3 },
        market_cap_change_percentage_24h_usd: 2.34,
        updated_at: Math.floor(Date.now() / 1000),
    };

    try {
        const res = await fetcher<GlobalMarketResponse>('/global', {}, 120);
        return res?.data ?? fallbackGlobal;
    } catch {
        return fallbackGlobal;
    }
}

export async function getFearAndGreedIndex(): Promise<FearGreedEntry[]> {
    try {
        const res = await fetch('https://api.alternative.me/fng/?limit=7', {
            signal: AbortSignal.timeout(6000),
            next: { revalidate: 600 },
        });
        if (!res.ok) throw new Error('Failed to fetch F&G');
        const json = (await res.json()) as { data?: FearGreedEntry[] };
        if (Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
        }
        throw new Error('Empty F&G data');
    } catch {
        return [
            {
                value: '72',
                value_classification: 'Greed',
                timestamp: String(Math.floor(Date.now() / 1000)),
            },
            {
                value: '68',
                value_classification: 'Greed',
                timestamp: String(Math.floor(Date.now() / 1000) - 86400),
            },
            {
                value: '64',
                value_classification: 'Greed',
                timestamp: String(Math.floor(Date.now() / 1000) - 172800),
            },
            {
                value: '55',
                value_classification: 'Neutral',
                timestamp: String(Math.floor(Date.now() / 1000) - 259200),
            },
            {
                value: '59',
                value_classification: 'Greed',
                timestamp: String(Math.floor(Date.now() / 1000) - 345600),
            },
            {
                value: '66',
                value_classification: 'Greed',
                timestamp: String(Math.floor(Date.now() / 1000) - 432000),
            },
            {
                value: '70',
                value_classification: 'Greed',
                timestamp: String(Math.floor(Date.now() / 1000) - 518400),
            },
        ];
    }
}

export async function getPools(
    id: string,
    network?: string | null,
    contractAddress?: string | null,
): Promise<PoolData> {
    const fallback: PoolData = {
        id: '',
        address: '',
        name: '',
        network: '',
    };

    if (network && contractAddress) {
        try {
            const poolData = await fetcher<{
                data: PoolData[];
            }>(
                `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
            );

            return poolData.data?.[0] ?? fallback;
        } catch {
            return fallback;
        }
    }

    try {
        const poolData = await fetcher<{
            data: PoolData[];
        }>('/onchain/search/pools', {
            query: id,
        });

        return poolData.data?.[0] ?? fallback;
    } catch {
        return fallback;
    }
}
