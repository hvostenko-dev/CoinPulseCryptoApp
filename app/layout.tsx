import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import Header from '@/components/Header';
import GlobalMarketStrip from '@/components/GlobalMarketStrip';
import { NexusProvider } from '@/components/providers/NexusProvider';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'NexusFi Pro — Institutional Crypto Intelligence & Terminal',
    description:
        'Next-generation cryptocurrency analytics terminal with real-time OHLC charts, portfolio P&L tracker, market heatmap, price alerts, and DCA / Market Cap simulators.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#050811] pb-20 text-slate-100 antialiased lg:pb-0`}
            >
                <NexusProvider>
                    <Suspense
                        fallback={
                            <div className="h-16 border-b border-white/5 bg-[#050811]" />
                        }
                    >
                        <GlobalMarketStrip />
                    </Suspense>
                    <Header />
                    <div className="min-h-[calc(100vh-140px)]">{children}</div>

                    <footer className="mt-16 border-t border-white/[0.07] bg-[#04070e] py-8 text-xs text-slate-400">
                        <div className="mx-auto flex max-w-360 flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
                            <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-emerald-400">
                                    NEXUSFI PRO v2.4
                                </span>
                                <span>•</span>
                                <span>
                                    Institutional Crypto Screener & Quantitative
                                    Analytics
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-slate-400">
                                <span>Next.js 16 + React 19</span>
                                <span>•</span>
                                <span>TradingView Lightweight Charts</span>
                                <span>•</span>
                                <span>CoinGecko Market Feed</span>
                            </div>
                        </div>
                    </footer>
                </NexusProvider>
            </body>
        </html>
    );
}
