'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <PublicHeader />

      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 sm:px-6 py-24"
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[var(--status-down)] flex items-center justify-center border border-rose-200 dark:border-rose-800/40 shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--status-down)]">
              Application Notice
            </span>
            <h1 className="text-2xl font-display font-bold text-[var(--neutral-900)] dark:text-white">
              Something went wrong loading this view
            </h1>
            <p className="text-sm text-[var(--neutral-500)] dark:text-[var(--neutral-400)] leading-relaxed">
              We encountered an unexpected error while retrieving data. You can try refreshing the
              view or returning home.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => reset()}
              className="btn-primary w-full sm:w-auto text-xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Request</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-[var(--neutral-0)] border border-[var(--neutral-200)] dark:border-[var(--neutral-700)] text-[var(--neutral-700)] dark:text-[var(--neutral-200)] hover:bg-[var(--neutral-100)] transition-all shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
