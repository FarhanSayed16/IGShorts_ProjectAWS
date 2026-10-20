import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Globe, TrendingUp, Trophy, ArrowRight, ShieldCheck, Sparkles, Clock } from 'lucide-react';
import { CHART_KEYS } from '@igshorts/shared';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { fetchChartMeta } from '@/lib/api/client';

export const metadata: Metadata = {
  title: 'All Instagram Charts & Leaderboards — IGshorts',
  description:
    'Browse the complete index of verified Instagram follower leaderboards including Global Top Persons and India Top Persons.',
};

export default async function ChartsIndexPage() {
  let globalMeta = null;
  let indiaMeta = null;

  try {
    const [gRes, iRes] = await Promise.all([
      fetchChartMeta(CHART_KEYS.GLOBAL_PERSONS),
      fetchChartMeta(CHART_KEYS.INDIA_PERSONS),
    ]);
    globalMeta = gRes;
    indiaMeta = iRes;
  } catch {
    // Graceful offline fallback
  }

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Header Section */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold/15 text-gold border border-gold/30 mb-3">
            <Trophy className="w-3.5 h-3.5 text-gold" />
            Discovery Leaderboards
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight">
            Instagram Charts Index
          </h1>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">
            Select a watchlist leaderboard. Ranks use public follower counts only — not all of
            Instagram, and not impressions.
          </p>
        </div>

        {/* Available Leaderboards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Global Top Persons Card */}
          <div className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-navy/5 text-navy">
                  <Globe className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                Global Top Persons
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                The world’s most followed individuals on Instagram, spanning iconic football stars,
                chart-topping musicians, and cultural icons.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-6">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Ranked Figures
                  </span>
                  <span className="text-xl font-mono font-bold text-slate-900">
                    {globalMeta?.ranked_profiles ?? 'unavailable'}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Algorithm
                  </span>
                  <span className="text-sm font-mono font-semibold text-navy">followers_v1</span>
                </div>
              </div>
            </div>

            <Link
              href="/charts/global"
              className="inline-flex items-center justify-between w-full px-5 py-3.5 rounded-xl font-semibold bg-navy text-white hover:bg-navy-2 transition-all group"
            >
              <span>Explore Global Chart</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* India Top Persons Card */}
          <div className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gold/10 text-gold">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                India Top Persons
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                India’s preeminent public figures, Bollywood stars, cricket legends, and leading
                content creators ranked by verified public followers.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-6">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Ranked Figures
                  </span>
                  <span className="text-xl font-mono font-bold text-slate-900">
                    {indiaMeta?.ranked_profiles ?? 'unavailable'}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Algorithm
                  </span>
                  <span className="text-sm font-mono font-semibold text-navy">followers_v1</span>
                </div>
              </div>
            </div>

            <Link
              href="/charts/india"
              className="inline-flex items-center justify-between w-full px-5 py-3.5 rounded-xl font-semibold bg-navy text-white hover:bg-navy-2 transition-all group"
            >
              <span>Explore India Chart</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Future Scope Preview Card */}
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-slate-200 text-slate-600 shrink-0">
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Upcoming Charts: Brands, Sports Clubs & Regional Tabulations
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  Corporate brands (Nike, Apple, Zomato) and sports teams are actively tracked in
                  our core database and will debut in dedicated future tabs to keep individual
                  people charts pure.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              Roadmap v2
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
