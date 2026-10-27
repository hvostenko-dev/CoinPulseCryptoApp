'use client';

import { useEffect, useRef, useState } from 'react';
import { fetcher } from '@/lib/coingecko.actions';

const ENABLE_COINGECKO_WEBSOCKET = false;
const PRICE_POLL_INTERVAL = 15_000;

interface SimplePriceData {
    usd?: number;
    usd_24h_change?: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
    last_updated_at?: number;
}

type SimplePriceResponse = Record<string, SimplePriceData | undefined>;

export const useCoinGeckoWebSocket = ({
    coinId,
    poolId,
    liveInterval,
    fallbackBasePrice,
}: UseCoinGeckoWebSocketProps): UseCoinGeckoWebSocketReturn => {
    const wsRef = useRef<WebSocket | null>(null);
    const subscribed = useRef<Set<string>>(new Set());

    const [price, setPrice] = useState<ExtendedPriceData | null>(null);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);

    const [isWsReady, setIsWsReady] = useState(false);
    const [isPollingReady, setIsPollingReady] = useState(false);

    useEffect(() => {
        let isActive = true;

        const seedInitialTrades = (basePrice: number) => {
            if (!basePrice || basePrice <= 0) return;
            const nowSec = Math.floor(Date.now() / 1000);
            const initial: Trade[] = Array.from({ length: 6 }, (_, idx) => {
                const isBuy = (idx + coinId.length) % 2 === 0;
                const jitter = 1 + ((idx % 3) - 1) * 0.0006;
                const tradePrice = basePrice * jitter;
                const amount =
                    basePrice > 10000
                        ? Number((0.02 + idx * 0.045).toFixed(4))
                        : basePrice > 100
                          ? Number((0.4 + idx * 0.85).toFixed(4))
                          : Number((45 + idx * 120).toFixed(2));
                return {
                    price: tradePrice,
                    amount,
                    value: tradePrice * amount,
                    type: isBuy ? 'b' : 's',
                    timestamp: nowSec - idx * 9,
                };
            });
            setTrades(initial);
        };

        if (fallbackBasePrice && fallbackBasePrice > 0) {
            seedInitialTrades(fallbackBasePrice);
        }

        const fetchCurrentPrice = async (): Promise<void> => {
            try {
                const response = await fetcher<SimplePriceResponse>(
                    '/simple/price',
                    {
                        ids: coinId,
                        vs_currencies: 'usd',
                        include_24hr_change: true,
                        include_market_cap: true,
                        include_24hr_vol: true,
                        include_last_updated_at: true,
                    },
                    0,
                );

                if (!isActive) return;

                const coinPrice = response?.[coinId];

                if (!coinPrice) {
                    setIsPollingReady(false);
                    return;
                }

                const currentPrice = coinPrice.usd ?? fallbackBasePrice ?? 0;

                setPrice({
                    usd: currentPrice,
                    coin: coinId,
                    price: currentPrice,
                    change24h: coinPrice.usd_24h_change ?? 0,
                    marketCap: coinPrice.usd_market_cap ?? 0,
                    volume24h: coinPrice.usd_24h_vol ?? 0,
                    timestamp:
                        coinPrice.last_updated_at ??
                        Math.floor(Date.now() / 1000),
                });

                setTrades((prev) => {
                    if (prev.length === 0 && currentPrice > 0) {
                        seedInitialTrades(currentPrice);
                        return prev;
                    }
                    return prev;
                });

                setIsPollingReady(true);
            } catch {
                if (!isActive) return;
                setIsPollingReady(false);
            }
        };

        void fetchCurrentPrice();

        const pollingInterval = window.setInterval(() => {
            void fetchCurrentPrice();
        }, PRICE_POLL_INTERVAL);

        // Simulated real-time orderflow tape around live price for Demo API
        const tradeTicker = window.setInterval(() => {
            if (!isActive) return;
            setTrades((prev) => {
                const refPrice =
                    price?.usd ?? prev[0]?.price ?? fallbackBasePrice ?? 0;
                if (!refPrice || refPrice <= 0) return prev;
                const isBuy = Math.random() > 0.46;
                const delta = (Math.random() - 0.495) * 0.0014;
                const nextPrice = refPrice * (1 + delta);
                const amount =
                    refPrice > 10000
                        ? Number((0.01 + Math.random() * 0.25).toFixed(4))
                        : refPrice > 100
                          ? Number((0.2 + Math.random() * 4.5).toFixed(4))
                          : Number((25 + Math.random() * 650).toFixed(2));

                const nextTrade: Trade = {
                    price: nextPrice,
                    amount,
                    value: nextPrice * amount,
                    type: isBuy ? 'b' : 's',
                    timestamp: Math.floor(Date.now() / 1000),
                };
                return [nextTrade, ...prev].slice(0, 7);
            });
        }, 4500);

        return () => {
            isActive = false;
            window.clearInterval(pollingInterval);
            window.clearInterval(tradeTicker);
        };
    }, [coinId, fallbackBasePrice]);

    useEffect(() => {
        if (!ENABLE_COINGECKO_WEBSOCKET) {
            setIsWsReady(false);
            return;
        }
    }, [coinId, poolId, liveInterval]);

    return {
        price,
        trades,
        ohlcv,
        isConnected: isWsReady || isPollingReady,
    };
};
