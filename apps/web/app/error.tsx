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
    // Log error to diagnostic reporting
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <PublicHeader />

      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 sm:px-6 py-20"
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600">
              System Notice
            </span>
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              Something went wrong loading this view
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              We encountered an unexpected error while retrieving data. You can try refreshing the
              view or returning home.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold bg-navy text-white hover:bg-navy-2 transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
