'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Bell, CheckCircle2, Sparkles, TrendingUp, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface QuickCoinMeta {
    id: string;
    symbol: string;
    name: string;
    image: string;
    currentPrice: number;
}

interface ToastMessage {
    id: string;
    title: string;
    description: string;
    type: 'success' | 'alert' | 'info';
}

interface NexusContextValue {
    watchlist: string[];
    toggleWatchlist: (coinId: string, coinName?: string) => void;
    isWatched: (coinId: string) => boolean;
    holdings: PortfolioHolding[];
    addHolding: (holding: Omit<PortfolioHolding, 'id' | 'addedAt'>) => void;
    removeHolding: (id: string) => void;
    loadDemoPortfolio: () => void;
    clearPortfolio: () => void;
    alerts: PriceAlert[];
    addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void;
    removeAlert: (id: string) => void;
    triggerDemoAlert: (alertId: string) => void;
    openAlertModal: (coin: QuickCoinMeta) => void;
    openPortfolioModal: (coin: QuickCoinMeta) => void;
    notify: (title: string, description: string, type?: ToastMessage['type']) => void;
}

const NexusContext = createContext<NexusContextValue | null>(null);

const STORAGE_KEYS = {
    WATCHLIST: 'nexusfi_watchlist_v1',
    HOLDINGS: 'nexusfi_holdings_v1',
    ALERTS: 'nexusfi_alerts_v1',
};

const DEMO_HOLDINGS: PortfolioHolding[] = [
    {
        id: 'demo-btc',
        coinId: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png',
        amount: 0.65,
        avgBuyPrice: 68400,
        notes: 'Core cold-storage allocation',
        addedAt: '2026-06-15',
    },
    {
        id: 'demo-eth',
        coinId: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        image: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png',
        amount: 6.5,
        avgBuyPrice: 2450,
        notes: 'Staked L1 validator position',
        addedAt: '2026-07-10',
    },
    {
        id: 'demo-sol',
        coinId: 'solana',
        symbol: 'sol',
        name: 'Solana',
        image: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png',
        amount: 85,
        avgBuyPrice: 138,
        notes: 'High-throughput DeFi ecosystem bet',
        addedAt: '2026-08-04',
    },
    {
        id: 'demo-link',
        coinId: 'chainlink',
        symbol: 'link',
        name: 'Chainlink',
        image: 'https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
        amount: 320,
        avgBuyPrice: 13.2,
        notes: 'RWA & oracle infrastructure play',
        addedAt: '2026-09-12',
    },
];

const DEMO_ALERTS: PriceAlert[] = [
    {
        id: 'alert-btc-100k',
        coinId: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png',
        targetPrice: 105000,
        condition: 'above',
        createdAt: '2026-10-20',
        triggered: false,
    },
    {
        id: 'alert-sol-200',
        coinId: 'solana',
        symbol: 'SOL',
        name: 'Solana',
        image: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png',
        targetPrice: 220,
        condition: 'above',
        createdAt: '2026-10-22',
        triggered: false,
    },
];

export const NexusProvider = ({ children }: { children: React.ReactNode }) => {
    const [watchlist, setWatchlist] = useState<string[]>([
        'bitcoin',
        'ethereum',
        'solana',
    ]);
    const [holdings, setHoldings] = useState<PortfolioHolding[]>(DEMO_HOLDINGS);
    const [alerts, setAlerts] = useState<PriceAlert[]>(DEMO_ALERTS);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Modal state for quick actions
    const [alertModalCoin, setAlertModalCoin] = useState<QuickCoinMeta | null>(
        null,
    );
    const [alertTargetPrice, setAlertTargetPrice] = useState<string>('');
    const [alertCondition, setAlertCondition] = useState<'above' | 'below'>(
        'above',
    );

    const [portfolioModalCoin, setPortfolioModalCoin] =
        useState<QuickCoinMeta | null>(null);
    const [holdingAmount, setHoldingAmount] = useState<string>('1');
    const [holdingBuyPrice, setHoldingBuyPrice] = useState<string>('');
    const [holdingNotes, setHoldingNotes] = useState<string>('');

    useEffect(() => {
        try {
            const savedWatchlist = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
            if (savedWatchlist) {
                setWatchlist(JSON.parse(savedWatchlist));
            }
            const savedHoldings = localStorage.getItem(STORAGE_KEYS.HOLDINGS);
            if (savedHoldings) {
                setHoldings(JSON.parse(savedHoldings));
            }
            const savedAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
            if (savedAlerts) {
                setAlerts(JSON.parse(savedAlerts));
            }
        } catch {
            // Ignore localStorage parse errors
        }
    }, []);

    const notify = useCallback(
        (
            title: string,
            description: string,
            type: ToastMessage['type'] = 'success',
        ) => {
            const id = `${Date.now()}-${Math.random()}`;
            setToasts((prev) => [...prev.slice(-3), { id, title, description, type }]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 4200);
        },
        [],
    );

    const toggleWatchlist = useCallback(
        (coinId: string, coinName?: string) => {
            setWatchlist((prev) => {
                const exists = prev.includes(coinId);
                const next = exists
                    ? prev.filter((id) => id !== coinId)
                    : [...prev, coinId];
                try {
                    localStorage.setItem(
                        STORAGE_KEYS.WATCHLIST,
                        JSON.stringify(next),
                    );
                } catch {}
                const label = coinName || coinId.toUpperCase();
                notify(
                    exists ? 'Removed from Watchlist' : 'Added to Watchlist',
                    exists
                        ? `${label} was removed from your starred assets.`
                        : `${label} is now tracked in your Watchlist.`,
                    'info',
                );
                return next;
            });
        },
        [notify],
    );

    const isWatched = useCallback(
        (coinId: string) => watchlist.includes(coinId),
        [watchlist],
    );

    const addHolding = useCallback(
        (holding: Omit<PortfolioHolding, 'id' | 'addedAt'>) => {
            const newItem: PortfolioHolding = {
                ...holding,
                id: `holding-${Date.now()}`,
                addedAt: new Date().toISOString().split('T')[0],
            };
            setHoldings((prev) => {
                const next = [newItem, ...prev];
                try {
                    localStorage.setItem(
                        STORAGE_KEYS.HOLDINGS,
                        JSON.stringify(next),
                    );
                } catch {}
                return next;
            });
            notify(
                'Position Added to Portfolio',
                `Added ${holding.amount} ${holding.symbol.toUpperCase()} @ ${formatCurrency(holding.avgBuyPrice)}`,
                'success',
            );
        },
        [notify],
    );

    const removeHolding = useCallback(
        (id: string) => {
            setHoldings((prev) => {
                const next = prev.filter((item) => item.id !== id);
                try {
                    localStorage.setItem(
                        STORAGE_KEYS.HOLDINGS,
                        JSON.stringify(next),
                    );
                } catch {}
                return next;
            });
            notify('Position Removed', 'Portfolio allocation updated.', 'info');
        },
        [notify],
    );

    const loadDemoPortfolio = useCallback(() => {
        setHoldings(DEMO_HOLDINGS);
        try {
            localStorage.setItem(
                STORAGE_KEYS.HOLDINGS,
                JSON.stringify(DEMO_HOLDINGS),
            );
        } catch {}
        notify(
            'Institutional Demo Portfolio Loaded',
            'Populated 4 whale positions (BTC, ETH, SOL, LINK) with real-time P&L.',
            'success',
        );
    }, [notify]);

    const clearPortfolio = useCallback(() => {
        setHoldings([]);
        try {
            localStorage.setItem(STORAGE_KEYS.HOLDINGS, JSON.stringify([]));
        } catch {}
        notify('Portfolio Cleared', 'All positions have been reset.', 'info');
    }, [notify]);

    const addAlert = useCallback(
        (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => {
            const newAlert: PriceAlert = {
                ...alert,
                id: `alert-${Date.now()}`,
                createdAt: new Date().toISOString().split('T')[0],
                triggered: false,
            };
            setAlerts((prev) => {
                const next = [newAlert, ...prev];
                try {
                    localStorage.setItem(
                        STORAGE_KEYS.ALERTS,
                        JSON.stringify(next),
                    );
                } catch {}
                return next;
            });
            notify(
                'Price Alert Armed',
                `Alert set for ${alert.symbol.toUpperCase()} ${alert.condition} ${formatCurrency(alert.targetPrice)}`,
                'alert',
            );
        },
        [notify],
    );

    const removeAlert = useCallback(
        (id: string) => {
            setAlerts((prev) => {
                const next = prev.filter((a) => a.id !== id);
                try {
                    localStorage.setItem(
                        STORAGE_KEYS.ALERTS,
                        JSON.stringify(next),
                    );
                } catch {}
                return next;
            });
            notify('Alert Removed', 'Price alert rule deleted.', 'info');
        },
        [notify],
    );

    const triggerDemoAlert = useCallback(
        (alertId: string) => {
            setAlerts((prev) => {
                const target = prev.find((a) => a.id === alertId);
                if (target) {
                    notify(
                        `⚡ PRICE ALERT TRIGGERED: ${target.symbol.toUpperCase()}`,
                        `${target.name} crossed your ${target.condition.toUpperCase()} target of ${formatCurrency(target.targetPrice)}!`,
                        'alert',
                    );
                }
                const next = prev.map((a) =>
                    a.id === alertId ? { ...a, triggered: true } : a,
                );
                try {
                    localStorage.setItem(
                        STORAGE_KEYS.ALERTS,
                        JSON.stringify(next),
                    );
                } catch {}
                return next;
            });
        },
        [notify],
    );

    const openAlertModal = useCallback((coin: QuickCoinMeta) => {
        setAlertModalCoin(coin);
        setAlertTargetPrice(
            (coin.currentPrice * 1.05).toFixed(coin.currentPrice < 1 ? 4 : 2),
        );
        setAlertCondition('above');
    }, []);

    const openPortfolioModal = useCallback((coin: QuickCoinMeta) => {
        setPortfolioModalCoin(coin);
        setHoldingAmount('1');
        setHoldingBuyPrice(
            coin.currentPrice.toFixed(coin.currentPrice < 1 ? 4 : 2),
        );
        setHoldingNotes('');
    }, []);

    const handleAlertSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!alertModalCoin) return;
        const parsed = parseFloat(alertTargetPrice);
        if (isNaN(parsed) || parsed <= 0) return;

        addAlert({
            coinId: alertModalCoin.id,
            symbol: alertModalCoin.symbol,
            name: alertModalCoin.name,
            image: alertModalCoin.image,
            targetPrice: parsed,
            condition: alertCondition,
        });
        setAlertModalCoin(null);
    };

    const handlePortfolioSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!portfolioModalCoin) return;
        const qty = parseFloat(holdingAmount);
        const buy = parseFloat(holdingBuyPrice);
        if (isNaN(qty) || qty <= 0 || isNaN(buy) || buy < 0) return;

        addHolding({
            coinId: portfolioModalCoin.id,
            symbol: portfolioModalCoin.symbol,
            name: portfolioModalCoin.name,
            image: portfolioModalCoin.image,
            amount: qty,
            avgBuyPrice: buy,
            notes: holdingNotes.trim() || undefined,
        });
        setPortfolioModalCoin(null);
    };

    const value = useMemo(
        () => ({
            watchlist,
            toggleWatchlist,
            isWatched,
            holdings,
            addHolding,
            removeHolding,
            loadDemoPortfolio,
            clearPortfolio,
            alerts,
            addAlert,
            removeAlert,
            triggerDemoAlert,
            openAlertModal,
            openPortfolioModal,
            notify,
        }),
        [
            watchlist,
            toggleWatchlist,
            isWatched,
            holdings,
            addHolding,
            removeHolding,
            loadDemoPortfolio,
            clearPortfolio,
            alerts,
            addAlert,
            removeAlert,
            triggerDemoAlert,
            openAlertModal,
            openPortfolioModal,
            notify,
        ],
    );

    return (
        <NexusContext.Provider value={value}>
            {children}

            {/* Quick Price Alert Modal */}
            {alertModalCoin && (
                <div
                    className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
                    onClick={() => setAlertModalCoin(null)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-emerald-500/25 bg-[#0a101d] p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={alertModalCoin.image}
                                    alt={alertModalCoin.name}
                                    className="size-9 rounded-full"
                                />
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        Set Price Alert
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        {alertModalCoin.name} (
                                        {alertModalCoin.symbol.toUpperCase()}) •
                                        Current:{' '}
                                        <span className="font-mono text-emerald-400">
                                            {formatCurrency(
                                                alertModalCoin.currentPrice,
                                            )}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAlertModalCoin(null)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleAlertSubmit}
                            className="mt-5 space-y-4"
                        >
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Trigger Condition
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAlertCondition('above')
                                        }
                                        className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                                            alertCondition === 'above'
                                                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                                                : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        📈 Price Goes Above
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAlertCondition('below')
                                        }
                                        className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                                            alertCondition === 'below'
                                                ? 'border-rose-500 bg-rose-500/15 text-rose-300'
                                                : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        📉 Price Drops Below
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Target Price (USD)
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    value={alertTargetPrice}
                                    onChange={(e) =>
                                        setAlertTargetPrice(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 font-mono text-base text-white outline-none focus:border-emerald-500"
                                />
                                <div className="mt-2 flex gap-2">
                                    {[
                                        { label: '-10%', mult: 0.9 },
                                        { label: '-5%', mult: 0.95 },
                                        { label: '+5%', mult: 1.05 },
                                        { label: '+10%', mult: 1.1 },
                                        { label: '+25%', mult: 1.25 },
                                    ].map((preset) => (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => {
                                                setAlertCondition(
                                                    preset.mult >= 1
                                                        ? 'above'
                                                        : 'below',
                                                );
                                                setAlertTargetPrice(
                                                    (
                                                        alertModalCoin.currentPrice *
                                                        preset.mult
                                                    ).toFixed(
                                                        alertModalCoin.currentPrice <
                                                            1
                                                            ? 4
                                                            : 2,
                                                    ),
                                                );
                                            }}
                                            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
                            >
                                <Bell size={16} />
                                Activate Price Alert
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Add to Portfolio Modal */}
            {portfolioModalCoin && (
                <div
                    className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
                    onClick={() => setPortfolioModalCoin(null)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-cyan-500/25 bg-[#0a101d] p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={portfolioModalCoin.image}
                                    alt={portfolioModalCoin.name}
                                    className="size-9 rounded-full"
                                />
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        Add Position to Portfolio
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        {portfolioModalCoin.name} (
                                        {portfolioModalCoin.symbol.toUpperCase()}
                                        ) • Market:{' '}
                                        <span className="font-mono text-cyan-400">
                                            {formatCurrency(
                                                portfolioModalCoin.currentPrice,
                                            )}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPortfolioModalCoin(null)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={handlePortfolioSubmit}
                            className="mt-5 space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Quantity ({portfolioModalCoin.symbol.toUpperCase()})
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        value={holdingAmount}
                                        onChange={(e) =>
                                            setHoldingAmount(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 font-mono text-sm text-white outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Avg Buy Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        value={holdingBuyPrice}
                                        onChange={(e) =>
                                            setHoldingBuyPrice(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 font-mono text-sm text-white outline-none focus:border-cyan-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Strategy / Thesis Note (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Core long-term hold, DCA entry..."
                                    value={holdingNotes}
                                    onChange={(e) =>
                                        setHoldingNotes(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs text-slate-400">
                                Total Cost Basis:{' '}
                                <span className="font-mono font-bold text-white">
                                    {formatCurrency(
                                        (parseFloat(holdingAmount) || 0) *
                                            (parseFloat(holdingBuyPrice) || 0),
                                    )}
                                </span>
                            </div>

                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110"
                            >
                                <TrendingUp size={16} />
                                Save Position
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Institutional Toast Notifications */}
            <div className="pointer-events-none fixed bottom-20 right-4 z-[99999] flex flex-col gap-2.5 sm:bottom-6 sm:right-6">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="pointer-events-auto flex w-80 items-start gap-3 rounded-2xl border border-emerald-500/30 bg-[#0b1322]/95 p-4 shadow-2xl backdrop-blur-xl transition-all sm:w-96"
                    >
                        <div className="mt-0.5 rounded-lg bg-emerald-500/15 p-2 text-emerald-400">
                            {toast.type === 'alert' ? (
                                <Bell size={18} />
                            ) : toast.type === 'info' ? (
                                <Sparkles size={18} />
                            ) : (
                                <CheckCircle2 size={18} />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white">
                                {toast.title}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-300">
                                {toast.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </NexusContext.Provider>
    );
};

export const useNexus = () => {
    const context = useContext(NexusContext);
    if (!context) {
        throw new Error('useNexus must be used within a NexusProvider');
    }
    return context;
};
