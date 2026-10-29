'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
                <AlertTriangle size={28} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">
                Terminal Feed Interrupted
            </h2>
            <p className="mt-2 text-sm text-slate-400">
                {error?.message ||
                    'An unexpected telemetry error occurred while loading market data.'}
            </p>
            <div className="mt-6 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => reset()}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:brightness-110"
                >
                    <RefreshCw size={15} />
                    Retry Connection
                </button>
                <Link
                    href="/"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                >
                    Return to Terminal
                </Link>
            </div>
        </div>
    );
}
