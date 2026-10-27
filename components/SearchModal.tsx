'use client';

import {
    ArrowUpRight,
    LoaderCircle,
    Search,
    Sparkles,
    X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SearchCoin {
    id: string;
    name: string;
    symbol: string;
    market_cap_rank: number | null;
    thumb: string;
}

interface SearchResponse {
    coins: SearchCoin[];
}

const QUICK_PICKS = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', rank: 1 },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', rank: 2 },
    { id: 'solana', symbol: 'SOL', name: 'Solana', rank: 4 },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', rank: 5 },
    { id: 'ripple', symbol: 'XRP', name: 'XRP', rank: 6 },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', rank: 14 },
    { id: 'sui', symbol: 'SUI', name: 'Sui', rank: 18 },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', rank: 8 },
];

const MIN_QUERY_LENGTH = 2;
const SEARCH_DELAY = 300;

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [isMounted, setIsMounted] = useState(false);
    const [query, setQuery] = useState('');
    const [coins, setCoins] = useState<SearchCoin[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const normalizedQuery = query.trim();

    const closeModal = () => {
        setQuery('');
        setCoins([]);
        setError(null);
        setIsLoading(false);
        onClose();
    };

    const handleCoinSelect = (coinId: string) => {
        closeModal();
        router.push(`/coins/${coinId}`);
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        const focusTimer = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 50);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
            window.clearTimeout(focusTimer);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        if (normalizedQuery.length < MIN_QUERY_LENGTH) {
            setCoins([]);
            setError(null);
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();

        const searchTimer = window.setTimeout(async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/search?q=${encodeURIComponent(normalizedQuery)}`,
                    {
                        method: 'GET',
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error('Search request failed');
                }

                const data = (await response.json()) as SearchResponse;

                setCoins(
                    Array.isArray(data.coins) ? data.coins.slice(0, 10) : [],
                );
            } catch (requestError) {
                if (
                    requestError instanceof DOMException &&
                    requestError.name === 'AbortError'
                ) {
                    return;
                }

                setCoins([]);
                setError('Could not search coins right now.');
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }, SEARCH_DELAY);

        return () => {
            window.clearTimeout(searchTimer);
            controller.abort();
        };
    }, [isOpen, normalizedQuery]);

    if (!isMounted || !isOpen) {
        return null;
    }

    return createPortal(
        <div
            role="presentation"
            onMouseDown={closeModal}
            className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto bg-black/80 px-3 pt-16 pb-6 backdrop-blur-xl sm:px-5 sm:pt-24"
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="coin-search-title"
                onMouseDown={(event) => event.stopPropagation()}
                className="relative flex max-h-[calc(100dvh-100px)] w-full max-w-[680px] flex-col overflow-hidden rounded-3xl border border-emerald-500/20 bg-[#080e1a] shadow-[0_35px_100px_rgba(0,0,0,0.85)]"
            >
                <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-[100px]" />
                <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-[100px]" />

                <div className="relative z-10 flex items-start justify-between gap-5 px-5 pt-6 pb-4 sm:px-7">
                    <div>
                        <p className="m-0 flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.18em] text-emerald-400 uppercase">
                            <Sparkles size={12} />
                            NexusFi Command Palette
                        </p>
                        <h2
                            id="coin-search-title"
                            className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl"
                        >
                            Search Crypto Assets
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        aria-label="Close search modal"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60 transition hover:border-emerald-500/40 hover:bg-white/10 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="relative z-10 mx-5 mb-4 sm:mx-7">
                    <Search
                        size={20}
                        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-emerald-400/70"
                    />

                    <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search by name or ticker (e.g. Bitcoin, SOL, ETH, Chainlink)..."
                        autoComplete="off"
                        spellCheck={false}
                        className="h-14 w-full rounded-2xl border border-white/12 bg-white/[0.05] px-12 text-[15px] font-medium text-white caret-emerald-400 outline-none transition placeholder:text-slate-500 hover:border-white/20 focus:border-emerald-500/70 focus:bg-white/[0.08] focus:ring-4 focus:ring-emerald-500/10 [&::-webkit-search-cancel-button]:hidden"
                    />

                    {query.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            aria-label="Clear search"
                            className="absolute top-1/2 right-4 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white"
                        >
                            <X size={17} />
                        </button>
                    )}
                </div>

                <div className="relative z-10 min-h-[260px] overflow-x-hidden overflow-y-auto px-5 pb-5 sm:px-7">
                    {normalizedQuery.length < MIN_QUERY_LENGTH ? (
                        <div className="space-y-4 py-2">
                            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                Instant Institutional Terminals
                            </p>
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                {QUICK_PICKS.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() =>
                                            handleCoinSelect(item.id)
                                        }
                                        className="group flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 text-left transition hover:border-emerald-500/40 hover:bg-emerald-500/[0.08]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs font-bold text-emerald-400">
                                                {item.symbol}
                                            </span>
                                            <ArrowUpRight
                                                size={14}
                                                className="text-slate-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-300"
                                            />
                                        </div>
                                        <p className="mt-2 truncate text-sm font-semibold text-white">
                                            {item.name}
                                        </p>
                                        <span className="mt-0.5 font-mono text-[10px] text-slate-500">
                                            Rank #{item.rank}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-slate-400">
                            <LoaderCircle
                                size={30}
                                className="animate-spin text-emerald-400"
                            />
                            <p className="text-sm">
                                Querying CoinGecko liquidity index...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-[240px] items-center justify-center px-8 text-center">
                            <p className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-3 text-sm text-rose-300">
                                {error}
                            </p>
                        </div>
                    ) : coins.length === 0 ? (
                        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-8 text-center text-slate-400">
                            <Search size={28} className="text-slate-600" />
                            <p className="text-sm">
                                No assets matched{' '}
                                <span className="font-semibold text-white">
                                    &ldquo;{normalizedQuery}&rdquo;
                                </span>
                            </p>
                        </div>
                    ) : (
                        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                            {coins.map((coin) => (
                                <li key={coin.id}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCoinSelect(coin.id)
                                        }
                                        className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-transparent bg-white/[0.02] px-3.5 py-3 text-left transition hover:translate-x-1 hover:border-emerald-500/30 hover:bg-emerald-500/10"
                                    >
                                        <span className="flex min-w-0 items-center gap-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.06]">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={coin.thumb}
                                                    alt={coin.name}
                                                    width={40}
                                                    height={40}
                                                    className="h-full w-full object-cover"
                                                />
                                            </span>

                                            <span className="flex min-w-0 flex-col items-start">
                                                <strong className="max-w-[200px] truncate text-sm font-semibold text-white sm:max-w-[380px]">
                                                    {coin.name}
                                                </strong>
                                                <span className="font-mono text-xs font-bold tracking-wider text-emerald-400/80 uppercase">
                                                    {coin.symbol}
                                                </span>
                                            </span>
                                        </span>

                                        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-xs font-semibold text-slate-400 group-hover:border-emerald-500/30 group-hover:text-emerald-300">
                                            {coin.market_cap_rank
                                                ? `#${coin.market_cap_rank}`
                                                : '—'}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <footer className="relative z-10 flex items-center justify-between gap-4 border-t border-white/[0.07] bg-black/30 px-5 py-3 text-[11px] text-slate-400 sm:px-7">
                    <span>
                        Shortcut: <kbd className="font-mono text-slate-300">⌘K</kbd> or{' '}
                        <kbd className="font-mono text-slate-300">Esc</kbd>
                    </span>
                    <span className="font-mono text-emerald-400/80">
                        NexusFi Intelligence Engine
                    </span>
                </footer>
            </section>
        </div>,
        document.body,
    );
};

export default SearchModal;
