import React from 'react';
import Link from 'next/link';
import { Compass, Home, Trophy } from 'lucide-react';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <PublicHeader />

      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 sm:px-6 py-24"
      >
        <div className="max-w-lg w-full text-center space-y-6">
          {/* Large Gradient 404 Headline (§12.11) */}
          <div className="font-display font-black text-7xl sm:text-9xl bg-gradient-to-r from-[var(--brand-accent)] via-[#F0DCA0] to-[var(--brand-accent)] bg-clip-text text-transparent tracking-tight select-none">
            404
          </div>

          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--neutral-900)] dark:text-white">
              Profile or Page Not Found
            </h1>
            <p className="text-sm text-[var(--neutral-500)] dark:text-[var(--neutral-400)] leading-relaxed max-w-sm mx-auto">
              The page or Instagram personality you are searching for is not on our monitored
              watchlist or may have been updated.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link href="/" className="btn-primary w-full sm:w-auto text-xs">
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
            <Link
              href="/charts/global"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-[var(--neutral-0)] border border-[var(--neutral-200)] dark:border-[var(--neutral-700)] text-[var(--neutral-700)] dark:text-[var(--neutral-200)] hover:bg-[var(--neutral-100)] transition-all shadow-sm"
            >
              <Trophy className="w-4 h-4 text-[var(--brand-accent)]" />
              <span>View Leaderboards</span>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
