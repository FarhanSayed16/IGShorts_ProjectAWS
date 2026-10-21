import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { Avatar } from '@/components/rank/avatar';
import { FollowerCount } from '@/components/rank/follower-count';
import { ErrorBanner } from '@/components/feedback/error-banner';
import { fetchProfiles, ProfileDetail } from '@/lib/api/client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Watchlist',
  description:
    'Every person on the IGshorts watchlist. Ranked names have a verified follower snapshot; others stay listed and unranked.',
};

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; scope?: string }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams?.q || '';
  const category = resolvedParams?.category || '';
  const scope = resolvedParams?.scope || '';

  let profiles: (ProfileDetail & { latestFollowerCount: number | null })[] = [];
  let total = 0;
  let hasApiError = false;

  try {
    const res = await fetchProfiles({
      limit: 100,
      offset: 0,
      q: q || undefined,
      category: category || undefined,
      scope: scope || undefined,
    });
    profiles = res.data;
    total = res.meta.total;
  } catch {
    hasApiError = true;
  }

  const CATEGORIES = [
    { label: 'All', value: '' },
    { label: 'Actor', value: 'Actor' },
    { label: 'Sports', value: 'Sports' },
    { label: 'Music', value: 'Music' },
    { label: 'Creator', value: 'Creator' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-10">
        {hasApiError && (
          <div className="mb-6">
            <ErrorBanner message="We couldn’t load the watchlist. No placeholder profiles are shown." />
          </div>
        )}

        <div className="mb-8">
          <h1 className="chart-title text-5xl sm:text-7xl text-[var(--ink)]">Watchlist</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-3 max-w-2xl leading-relaxed">
            Every name we track{total ? ` — ${total} on the list` : ''}. Missing follower counts stay
            blank and unranked. Brands stay listed here; people charts stay people-only.
          </p>
        </div>

        <form method="GET" action="/profiles" className="relative max-w-md mb-6">
          <Search className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2" />
          {category ? <input type="hidden" name="category" value={category} /> : null}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search the watchlist"
            className="w-full border border-[var(--line)] bg-[var(--surface)] pl-10 pr-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--ink)]"
          />
        </form>

        <div className="flex items-center gap-0 overflow-x-auto mb-6 border border-[var(--ink)] w-fit">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.value;
            const href = cat.value
              ? `/profiles?category=${cat.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`
              : `/profiles${q ? `?q=${encodeURIComponent(q)}` : ''}`;

            return (
              <Link
                key={cat.label}
                href={href}
                className={`px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] whitespace-nowrap ${
                  isSelected
                    ? 'bg-[var(--ink)] text-[var(--surface)]'
                    : 'text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]'
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {profiles.length > 0 ? (
          <div className="space-y-2">
            {profiles.map((profile) => (
              <Link
                key={profile.igUsername}
                href={`/profiles/${profile.igUsername}`}
                className="flex items-center gap-3 sm:gap-5 bg-[var(--surface)] border border-[var(--line)] px-3 sm:px-5 py-3 hover:border-[var(--ink)] transition-colors"
              >
                <Avatar
                  src={profile.avatarUrl}
                  name={profile.displayName}
                  size="md"
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-[15px] sm:text-lg text-[var(--ink)] truncate">
                    {profile.displayName}
                  </h2>
                  <p className="text-xs text-[var(--ink-muted)] truncate">@{profile.igUsername}</p>
                </div>
                <div className="hidden sm:block text-[10px] uppercase tracking-wider text-[var(--ink-faint)] text-right">
                  {profile.category || 'Person'}
                  {profile.countryRegion ? ` · ${profile.countryRegion}` : ''}
                </div>
                <div className="text-right shrink-0">
                  {profile.latestFollowerCount !== null ? (
                    <div className="text-base sm:text-lg font-semibold tabular-nums">
                      <FollowerCount count={profile.latestFollowerCount} />
                    </div>
                  ) : (
                    <span className="text-[11px] uppercase tracking-wider text-[var(--ink-faint)]">
                      Unranked
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-[var(--ink-muted)] border border-[var(--line)] bg-[var(--surface)]">
            No names match that search.
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
