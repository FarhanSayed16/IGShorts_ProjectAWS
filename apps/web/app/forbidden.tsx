import React from 'react';
import Link from 'next/link';
import { Home, ShieldOff } from 'lucide-react';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';

export default function Forbidden() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <PublicHeader />

      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 sm:px-6 py-24"
      >
        <div className="max-w-lg w-full text-center space-y-6">
          <div
            className="font-display font-black text-7xl sm:text-9xl tracking-tight select-none"
            style={{ color: '#00d26a' }}
          >
            403
          </div>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-white/20 bg-white/5 mx-auto">
            <ShieldOff className="w-6 h-6 text-white" />
          </div>

          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Access Forbidden
            </h1>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm mx-auto">
              You do not have permission to view this page. If you believe this is an error, return
              home or contact support.
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] bg-white text-black hover:bg-[#00d26a] transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
