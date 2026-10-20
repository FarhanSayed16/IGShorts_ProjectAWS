import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';

export const metadata: Metadata = {
  title: 'Account — coming soon',
  robots: { index: false, follow: false },
};

export default function AccountShellPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-canvas)]">
      <PublicHeader />
      <main id="main-content" className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-serif font-bold mb-3">Public accounts</h1>
        <p className="text-sm text-slate-600 mb-6">
          Sign-in for the public site is a later feature. Charts stay readable without an account.
        </p>
        <Link href="/" className="text-sm font-bold text-[var(--color-navy)] hover:underline">
          Back home
        </Link>
      </main>
      <PublicFooter />
    </div>
  );
}
