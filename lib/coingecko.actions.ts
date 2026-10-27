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

interface CoinGeckoApiError {
    error?: string;
    error_code?: number;
    error_message?: string;
    status?: {
        error_code?: number;
        error_message?: string;
    };
}

const rawBaseUrl =
    process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';
const rawApiKey = process.env.COINGECKO_API_KEY || '';

const BASE_URL: string = rawBaseUrl.replace(/\/+$/, '');
const API_KEY: string = rawApiKey;

export async function fetcher<T>(
    endpoint: string,
    params: CoinGeckoQueryParams = {},
    revalidate = 60,
): Promise<T> {
    const normalizedEndpoint = endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`;

    const url = qs.stringifyUrl(
        {
            url: `${BASE_URL}${normalizedEndpoint}`,
            query: params,
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

    const response = await fetch(url, {
        method: 'GET',
        headers,
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
        const errorBody =
            typeof responseBody === 'object' && responseBody !== null
                ? (responseBody as CoinGeckoApiError)
                : null;

        const errorMessage =
            errorBody?.status?.error_message ??
            errorBody?.error_message ??
            errorBody?.error ??
            responseText ??
            response.statusText;

        const errorCode =
            errorBody?.status?.error_code ?? errorBody?.error_code;

        console.error('CoinGecko API request failed:', {
            url,
            status: response.status,
            errorCode,
            errorMessage,
        });

        throw new Error(
            `CoinGecko API Error ${response.status}${
                errorCode ? ` (${errorCode})` : ''
            }: ${errorMessage}`,
        );
    }

    return responseBody as T;
}

export async function getGlobalMarketData(): Promise<
    GlobalMarketResponse['data']
> {
    try {
        const res = await fetcher<GlobalMarketResponse>('/global', {}, 120);
        return res.data;
    } catch {
        return {
            active_cryptocurrencies: 16842,
            markets: 1195,
            total_market_cap: { usd: 3_420_000_000_000 },
            total_volume: { usd: 148_500_000_000 },
            market_cap_percentage: { btc: 56.4, eth: 13.2, sol: 4.1, usdt: 4.3 },
            market_cap_change_percentage_24h_usd: 2.34,
            updated_at: Math.floor(Date.now() / 1000),
        };
    }
}

export async function getFearAndGreedIndex(): Promise<FearGreedEntry[]> {
    try {
        const res = await fetch('https://api.alternative.me/fng/?limit=7', {
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
        } catch (error) {
            console.error('Failed to fetch pool by contract:', error);

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
    } catch (error) {
        console.error('Failed to search pools:', error);

        return fallback;
    }
}
