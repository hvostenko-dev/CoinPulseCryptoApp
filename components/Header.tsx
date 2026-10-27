'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    Bell,
    Briefcase,
    Compass,
    FlaskConical,
    LayoutDashboard,
    Menu,
    Search,
    Star,
    X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import SearchModal from '@/components/SearchModal';
import { useNexus } from '@/components/providers/NexusProvider';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
    {
        label: 'Terminal',
        href: '/',
        icon: LayoutDashboard,
    },
    {
        label: 'Screener',
        href: '/coins',
        icon: Compass,
    },
    {
        label: 'Portfolio',
        href: '/portfolio',
        icon: Briefcase,
        badgeKey: 'holdings' as const,
    },
    {
        label: 'Watchlist',
        href: '/watchlist',
        icon: Star,
        badgeKey: 'watchlist' as const,
    },
    {
        label: 'Crypto Lab',
        href: '/lab',
        icon: FlaskConical,
    },
];

const Header = () => {
    const pathname = usePathname();
    const { watchlist, holdings, alerts } = useNexus();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsSearchOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const getBadgeCount = (key?: 'holdings' | 'watchlist') => {
        if (key === 'holdings') return holdings.length;
        if (key === 'watchlist') return watchlist.length;
        return 0;
    };

    const isRouteActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <>
            <header className="sticky top-0 z-50 h-18 border-b border-white/[0.08] bg-[#060a13]/85 backdrop-blur-xl">
                <div className="mx-auto flex h-full max-w-360 items-center justify-between gap-3 px-4 sm:px-6">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            aria-label="NexusFi home"
                            className="flex items-center gap-2 transition hover:opacity-90"
                        >
                            <Image
                                src="/logo.svg"
                                alt="NexusFi logo"
                                width={168}
                                height={38}
                                priority
                                style={{ height: '36px', width: 'auto' }}
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden items-center gap-1 lg:flex">
                            {NAV_LINKS.map((item) => {
                                const Icon = item.icon;
                                const active = isRouteActive(item.href);
                                const count = getBadgeCount(item.badgeKey);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'group relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all',
                                            active
                                                ? 'bg-emerald-500/12 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.3)]'
                                                : 'text-slate-400 hover:bg-white/[0.05] hover:text-white',
                                        )}
                                    >
                                        <Icon
                                            size={16}
                                            className={cn(
                                                'transition-colors',
                                                active
                                                    ? 'text-emerald-400'
                                                    : 'text-slate-400 group-hover:text-emerald-400',
                                            )}
                                        />
                                        <span>{item.label}</span>
                                        {count > 0 && (
                                            <span
                                                className={cn(
                                                    'rounded-full px-1.5 py-0.2 font-mono text-[11px] font-bold',
                                                    active
                                                        ? 'bg-emerald-500/25 text-emerald-300'
                                                        : 'bg-white/10 text-slate-300',
                                                )}
                                            >
                                                {count}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2.5">
                        {/* Command Search Bar Trigger */}
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen(true)}
                            aria-label="Open coin search"
                            aria-haspopup="dialog"
                            aria-expanded={isSearchOpen}
                            className="flex h-10 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-slate-300 transition hover:border-emerald-500/40 hover:bg-white/[0.07] hover:text-white"
                        >
                            <Search size={16} className="text-emerald-400" />
                            <span className="hidden text-slate-400 sm:inline">
                                Search assets, tickers...
                            </span>
                            <kbd className="hidden rounded-md border border-white/15 bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-slate-400 md:inline-block">
                                ⌘K
                            </kbd>
                        </button>

                        {/* Alerts Bell Shortcut */}
                        <Link
                            href="/watchlist"
                            aria-label="View price alerts"
                            className="relative flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-cyan-500/40 hover:bg-white/[0.08] hover:text-white"
                        >
                            <Bell size={17} />
                            {alerts.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-emerald-500 font-mono text-[10px] font-bold text-slate-950">
                                    {alerts.length}
                                </span>
                            )}
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button
                            type="button"
                            onClick={() =>
                                setIsMobileMenuOpen((prev) => !prev)
                            }
                            aria-label="Toggle navigation menu"
                            className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
                        >
                            {isMobileMenuOpen ? (
                                <X size={19} />
                            ) : (
                                <Menu size={19} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Slide-Down Drawer */}
                {isMobileMenuOpen && (
                    <div className="border-b border-white/10 bg-[#070c17]/98 px-4 py-4 backdrop-blur-2xl lg:hidden">
                        <nav className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            {NAV_LINKS.map((item) => {
                                const Icon = item.icon;
                                const active = isRouteActive(item.href);
                                const count = getBadgeCount(item.badgeKey);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition',
                                            active
                                                ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                                                : 'border border-white/5 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]',
                                        )}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Icon
                                                size={18}
                                                className={
                                                    active
                                                        ? 'text-emerald-400'
                                                        : 'text-slate-400'
                                                }
                                            />
                                            {item.label}
                                        </span>
                                        {count > 0 && (
                                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-xs text-emerald-300">
                                                {count}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </header>

            {/* Mobile Sticky Bottom Tab Bar for Native App Feel */}
            <nav
                aria-label="Mobile Bottom Navigation"
                className="fixed right-0 bottom-0 left-0 z-40 flex h-16 items-center justify-around border-t border-white/10 bg-[#060a13]/95 px-2 backdrop-blur-xl lg:hidden"
            >
                {NAV_LINKS.map((item) => {
                    const Icon = item.icon;
                    const active = isRouteActive(item.href);
                    const count = getBadgeCount(item.badgeKey);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition',
                                active
                                    ? 'text-emerald-400'
                                    : 'text-slate-400 hover:text-slate-200',
                            )}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                            {count > 0 && (
                                <span className="absolute top-0.5 right-2 flex size-4 items-center justify-center rounded-full bg-emerald-500 font-mono text-[9px] font-bold text-slate-950">
                                    {count}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </>
    );
};

export default Header;
