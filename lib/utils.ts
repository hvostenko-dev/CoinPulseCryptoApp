import { clsx, type ClassValue } from 'clsx';
import { Time } from 'lightweight-charts';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(
    value: number | null | undefined,
    digits?: number,
    currency?: string,
    showSymbol?: boolean,
) {
    if (value === null || value === undefined || isNaN(value)) {
        return showSymbol !== false ? '$0.00' : '0.00';
    }

    const absVal = Math.abs(value);
    const autoDigits =
        digits !== undefined
            ? digits
            : absVal > 0 && absVal < 0.01
              ? 6
              : absVal > 0 && absVal < 1
                ? 4
                : 2;

    if (showSymbol === undefined || showSymbol === true) {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: currency?.toUpperCase() || 'USD',
            minimumFractionDigits: Math.min(autoDigits, 2),
            maximumFractionDigits: autoDigits,
        });
    }
    return value.toLocaleString('en-US', {
        minimumFractionDigits: Math.min(autoDigits, 2),
        maximumFractionDigits: autoDigits,
    });
}

export function formatCompactNumber(
    value: number | null | undefined,
    showDollar = true,
): string {
    if (value === null || value === undefined || isNaN(value)) {
        return showDollar ? '$0.00' : '0';
    }
    const prefix = showDollar ? '$' : '';
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (abs >= 1_000_000_000_000) {
        return `${sign}${prefix}${(abs / 1_000_000_000_000).toFixed(2)}T`;
    }
    if (abs >= 1_000_000_000) {
        return `${sign}${prefix}${(abs / 1_000_000_000).toFixed(2)}B`;
    }
    if (abs >= 1_000_000) {
        return `${sign}${prefix}${(abs / 1_000_000).toFixed(2)}M`;
    }
    if (abs >= 1_000) {
        return `${sign}${prefix}${(abs / 1_000).toFixed(2)}K`;
    }
    return `${sign}${prefix}${abs.toFixed(2)}`;
}

export function formatPercentage(change: number | null | undefined): string {
    if (change === null || change === undefined || isNaN(change)) {
        return '0.0%';
    }
    const formattedChange = change.toFixed(2);
    return `${formattedChange}%`;
}

export function trendingClasses(value: number) {
    const isTrendingUp = value > 0;

    return {
        textClass: isTrendingUp ? 'text-emerald-400' : 'text-rose-400',
        bgClass: isTrendingUp ? 'bg-emerald-500/10' : 'bg-rose-500/10',
        iconClass: isTrendingUp ? 'icon-up' : 'icon-down',
    };
}

export function timeAgo(date: string | number | Date): string {
    const now = new Date();
    const past = new Date(
        typeof date === 'number' && date < 10_000_000_000 ? date * 1000 : date,
    );
    const diff = Math.max(0, now.getTime() - past.getTime());

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;

    return past.toISOString().split('T')[0];
}

export function convertOHLCData(data: OHLCData[]) {
    return data
        .map((d) => ({
            time: d[0] as Time,
            open: d[1],
            high: d[2],
            low: d[3],
            close: d[4],
        }))
        .filter(
            (item, index, arr) => index === 0 || item.time !== arr[index - 1].time,
        );
}

export const ELLIPSIS = 'ellipsis' as const;
export const buildPageNumbers = (
    currentPage: number,
    totalPages: number,
): (number | typeof ELLIPSIS)[] => {
    const MAX_VISIBLE_PAGES = 5;

    const pages: (number | typeof ELLIPSIS)[] = [];

    if (totalPages <= MAX_VISIBLE_PAGES) {
        for (let i = 1; i <= totalPages; i += 1) {
            pages.push(i);
        }
        return pages;
    }

    pages.push(1);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
        pages.push(ELLIPSIS);
    }

    for (let i = start; i <= end; i += 1) {
        pages.push(i);
    }

    if (end < totalPages - 1) {
        pages.push(ELLIPSIS);
    }

    pages.push(totalPages);

    return pages;
};
