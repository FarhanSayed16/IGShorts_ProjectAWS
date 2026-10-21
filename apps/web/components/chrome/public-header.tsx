'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

const TOP_LINKS = [
  { label: 'Charts', href: '/charts/global' },
  { label: 'Profiles', href: '/profiles' },
  { label: 'Methodology', href: '/methodology' },
  { label: 'About', href: '/about' },
];

const CHART_LINKS = [
  { label: 'Global 100', href: '/charts/global' },
  { label: 'India 100', href: '/charts/india' },
  { label: 'Movers', href: '/movers' },
  { label: 'Watchlist', href: '/profiles' },
];

export const PublicHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const openSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-[var(--header)] text-[var(--header-ink)] border-b border-[var(--line)]">
        <div className="px-5 sm:px-8 lg:px-10 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-[var(--header-ink)]"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="chart-title text-[28px] leading-none">
              IGSHORTS
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-[13px] font-semibold">
              {TOP_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isActive(link.href)
                      ? 'text-[var(--header-ink)]'
                      : 'text-[var(--ink-muted)] hover:text-[var(--header-ink)]'
                  }
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={openSearch}
              className="flex items-center gap-2 px-2 py-1.5 text-[var(--header-ink)] hover:opacity-70"
              title="Search profiles (⌘K / Ctrl+K)"
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline text-xs font-semibold uppercase tracking-wider">
                Search
              </span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <nav
        aria-label="Charts"
        className="bg-[var(--subnav)] text-[var(--subnav-ink)]"
      >
        <div className="px-5 sm:px-8 lg:px-10 h-10 flex items-center gap-7 overflow-x-auto">
          {CHART_LINKS.map((link) => {
            const active =
              link.href === '/charts/global'
                ? pathname === '/' || pathname.startsWith('/charts/global')
                : isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 text-[11px] font-bold uppercase tracking-[0.16em] py-2 border-b-2 ${
                  active
                    ? 'border-[var(--subnav-active)] text-white'
                    : 'border-transparent text-white/70 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative h-full w-72 bg-[var(--header)] text-[var(--header-ink)] border-r border-[var(--line)] p-5">
            <div className="flex items-center justify-between mb-8">
              <span className="chart-title text-2xl">IGSHORTS</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1">
              {[...TOP_LINKS, ...CHART_LINKS].map((link) => (
                <Link
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 text-sm font-semibold border-b border-[var(--line)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
