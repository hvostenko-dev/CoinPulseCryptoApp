'use client';

import React from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en" className="dark">
            <body className="flex min-h-screen flex-col items-center justify-center bg-[#050811] p-6 text-center text-slate-100 antialiased">
                <div className="max-w-md rounded-2xl border border-white/10 bg-[#0a101d] p-6 shadow-2xl">
                    <h2 className="text-xl font-bold text-white">
                        NexusFi Pro — System Recovery
                    </h2>
                    <p className="mt-2 text-xs text-slate-400">
                        {error?.message ||
                            'A unexpected runtime error occurred in the terminal.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="mt-5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:brightness-110"
                    >
                        Reload Terminal
                    </button>
                </div>
            </body>
        </html>
    );
}
