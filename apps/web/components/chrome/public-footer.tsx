import React from 'react';
import Link from 'next/link';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="mt-auto bg-[var(--footer)] text-[var(--footer-ink)]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <Link href="/" className="chart-title text-3xl text-white">
              IGSHORTS
            </Link>
            <p className="mt-4 text-xs leading-relaxed max-w-xs">
              Public charts of famous Instagram people on a tracked watchlist, ranked by follower
              count. Not all of Instagram. Not affiliated with Meta.
            </p>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white mb-3">
              Charts
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/charts/global" className="hover:text-white">
                  Global 100
                </Link>
              </li>
              <li>
                <Link href="/charts/india" className="hover:text-white">
                  India 100
                </Link>
              </li>
              <li>
                <Link href="/movers" className="hover:text-white">
                  Movers
                </Link>
              </li>
              <li>
                <Link href="/profiles" className="hover:text-white">
                  Watchlist
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white mb-3">
              About
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/methodology" className="hover:text-white">
                  Methodology
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white">
                  Operators
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-[11px] uppercase tracking-wider">
          <span>© {new Date().getFullYear()} IGshorts</span>
          <span>followers_v1 · public snapshots only</span>
        </div>
      </div>
    </footer>
  );
};
