import {
    CandlestickSeriesPartialOptions,
    ChartOptions,
    ColorType,
    DeepPartial,
} from 'lightweight-charts';

export const navItems = [
    {
        label: 'Terminal',
        href: '/',
    },
    {
        label: 'Screener',
        href: '/coins',
    },
    {
        label: 'Portfolio',
        href: '/portfolio',
    },
    {
        label: 'Watchlist',
        href: '/watchlist',
    },
    {
        label: 'Crypto Lab',
        href: '/lab',
    },
];

export const TERMINAL_QUICK_COINS = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { id: 'solana', symbol: 'SOL', name: 'Solana' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
    { id: 'ripple', symbol: 'XRP', name: 'XRP' },
] as const;

const CHART_COLORS = {
    background: '#080d16',
    text: '#94a3b8',
    grid: '#131d2e',
    border: '#1e293b',
    crosshairVertical: '#10b98166',
    crosshairHorizontal: '#06b6d444',
    candleUp: '#10B981',
    candleDown: '#F43F5E',
} as const;

export const getCandlestickConfig = (): CandlestickSeriesPartialOptions => ({
    upColor: CHART_COLORS.candleUp,
    downColor: CHART_COLORS.candleDown,
    wickUpColor: CHART_COLORS.candleUp,
    wickDownColor: CHART_COLORS.candleDown,
    borderVisible: true,
    wickVisible: true,
});

export const getChartConfig = (
    height: number,
    timeVisible: boolean = true,
): DeepPartial<ChartOptions> => ({
    width: 0,
    height,
    layout: {
        background: { type: ColorType.Solid, color: CHART_COLORS.background },
        textColor: CHART_COLORS.text,
        fontSize: 12,
        fontFamily: 'var(--font-geist-mono), Inter, monospace',
    },
    grid: {
        vertLines: {
            visible: true,
            color: '#111927',
            style: 2,
        },
        horzLines: {
            visible: true,
            color: CHART_COLORS.grid,
            style: 2,
        },
    },
    rightPriceScale: {
        borderColor: CHART_COLORS.border,
    },
    timeScale: {
        borderColor: CHART_COLORS.border,
        timeVisible,
        secondsVisible: false,
    },
    handleScroll: true,
    handleScale: true,
    crosshair: {
        mode: 1,
        vertLine: {
            visible: true,
            color: CHART_COLORS.crosshairVertical,
            width: 1,
            style: 2,
        },
        horzLine: {
            visible: true,
            color: CHART_COLORS.crosshairHorizontal,
            width: 1,
            style: 2,
        },
    },
    localization: {
        priceFormatter: (price: number) =>
            '$' +
            price.toLocaleString(undefined, {
                minimumFractionDigits: price < 1 ? 4 : 2,
                maximumFractionDigits: price < 1 ? 6 : 2,
            }),
    },
});

export const PERIOD_CONFIG: Record<
    Period,
    { days: number | string; interval?: 'hourly' | 'daily' }
> = {
    daily: { days: 1, interval: 'hourly' },
    weekly: { days: 7, interval: 'hourly' },
    monthly: { days: 30, interval: 'hourly' },
    '3months': { days: 90, interval: 'daily' },
    '6months': { days: 180, interval: 'daily' },
    yearly: { days: 365 },
    max: { days: 'max' },
};

export const PERIOD_BUTTONS: { value: Period; label: string }[] = [
    { value: 'daily', label: '1D' },
    { value: 'weekly', label: '1W' },
    { value: 'monthly', label: '1M' },
    { value: '3months', label: '3M' },
    { value: '6months', label: '6M' },
    { value: 'yearly', label: '1Y' },
    { value: 'max', label: 'Max' },
];

export const LIVE_INTERVAL_BUTTONS: { value: '1s' | '1m'; label: string }[] = [
    { value: '1s', label: '1s' },
    { value: '1m', label: '1m' },
];
