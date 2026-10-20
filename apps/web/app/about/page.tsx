import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Trophy, ShieldCheck, Globe, ArrowRight, Zap, Target } from 'lucide-react';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';

export const metadata: Metadata = {
  title: 'About IGshorts — The Discovery Platform for Instagram',
  description:
    'Learn about IGshorts, our mission to bring Billboard-style transparency and discovery to Instagram creator rankings.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="mb-10 pb-8 border-b border-slate-200">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold/15 text-gold mb-3">
            <Trophy className="w-3.5 h-3.5 text-gold" />
            About IGshorts
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight">
            Billboard × CoinMarketCap for Instagram
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            IGshorts was created to solve a simple problem: the lack of a transparent, credible, and
            public discovery leaderboard for Instagram personalities.
          </p>
        </div>

        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-bold text-slate-900">Our Mission</h2>
            <p>
              In the music industry, Billboard defines who dominates the charts. In crypto,
              CoinMarketCap provides clear price and volume rankings. But for social media’s biggest
              stage—Instagram—discovery has been fragmented across spammy scraper sites, dubious
              marketing blogs, and closed advertising tools.
            </p>
            <p>
              IGshorts delivers public discovery tables with clean aesthetic polish, verifiable
              numbers, and historical tracking.
            </p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
              <h3 className="font-bold text-slate-900 mb-1">Zero Scraping Spam</h3>
              <p className="text-xs text-slate-600">
                We monitor a verified universe with non-invasive API observation, never illegal
                firehose scrapers.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Target className="w-6 h-6 text-gold mb-2" />
              <h3 className="font-bold text-slate-900 mb-1">Human Figures First</h3>
              <p className="text-xs text-slate-600">
                Brands and sports franchises are tracked separately, keeping creator rankings pure.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Zap className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-bold text-slate-900 mb-1">Auditable Ranks</h3>
              <p className="text-xs text-slate-600">
                Every follower count maps to an immutable snapshot and a direct link to Instagram.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href="/methodology"
              className="inline-flex items-center gap-2 font-semibold text-navy hover:text-gold transition-colors"
            >
              <span>Read our complete ranking methodology</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
