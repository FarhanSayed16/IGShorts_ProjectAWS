import React from 'react';
import Link from 'next/link';
import { Compass, Home, Trophy, ArrowRight } from 'lucide-react';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <PublicHeader />

      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 sm:px-6 py-20"
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-navy/10 text-navy flex items-center justify-center">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Error 404
            </span>
            <h1 className="text-3xl font-serif font-bold text-slate-900">
              Profile or Page Not Found
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              The page or Instagram creator you are looking for is not in our tracked universe or
              may have been relocated.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold bg-navy text-white hover:bg-navy-2 transition-colors shadow-sm"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
            <Link
              href="/charts"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Trophy className="w-4 h-4 text-gold" />
              View Charts
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
