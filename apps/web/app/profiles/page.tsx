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
  title: 'Saved profiles',
  description:
    'Public profiles saved from FastSocial Top Charts, CC BY 4.0, together with the IGshorts seed lists.',
};

function pageHref(
  page: number,
  query: { q?: string; category?: string; measured?: 'yes' | 'no' },
) {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.category) params.set('category', query.category);
  if (query.measured === 'no') params.set('measured', 'no');
  if (page > 1) params.set('page', String(page));
  const text = params.toString();
  return text ? `/profiles?${text}` : '/profiles';
}

function sourceLabel(source: string | null) {
  if (source === 'fastsocial') return 'FastSocial integer';
  if (source === 'seed_xlsx') return 'Rounded seed';
  return null;
}

function pageNumbers(current: number, total: number): Array<number | 'gap'> {
  const wanted = new Set<number>([1, total, current - 2, current - 1, current, current + 1, current + 2]);
  const pages = [...wanted].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: Array<number | 'gap'> = [];
  for (const n of pages) {
    const prev = out[out.length - 1];
    if (typeof prev === 'number' && n - prev > 1) out.push('gap');
    out.push(n);
  }
  return out;
}

function ProfilePager({
  page,
  pageCount,
  q,
  category,
  measured,
  placement,
}: {
  page: number;
  pageCount: number;
  q: string;
  category: string;
  measured: 'yes' | 'no';
  placement: 'top' | 'bottom';
}) {
  const numbers = pageNumbers(page, pageCount);
  const idle =
    'inline-flex h-9 min-w-9 items-center justify-center border border-[var(--line)] bg-[var(--surface)] px-2 text-[11px] font-bold uppercase tracking-[0.12em] hover:border-[var(--ink)]';
  const current =
    'inline-flex h-9 min-w-9 items-center justify-center border border-[var(--ink)] bg-[var(--ink)] px-2 text-[11px] font-bold text-[var(--surface)]';
  const disabled = `${idle} pointer-events-none opacity-40`;

  return (
    <nav
      aria-label="Profile pages"
      className="flex flex-col gap-3 border border-[var(--line)] bg-[var(--surface)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-1">
        {page > 1 ? (
          <Link href={pageHref(1, { q, category, measured })} className={idle}>
            First
          </Link>
        ) : (
          <span className={disabled}>First</span>
        )}
        {page > 1 ? (
          <Link href={pageHref(page - 1, { q, category, measured })} className={idle}>
            Prev
          </Link>
        ) : (
          <span className={disabled}>Prev</span>
        )}
        {numbers.map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${index}`} className="px-1 text-[var(--ink-faint)]">
              …
            </span>
          ) : (
            <Link
              key={item}
              href={pageHref(item, { q, category, measured })}
              aria-current={item === page ? 'page' : undefined}
              className={item === page ? current : idle}
            >
              {item}
            </Link>
          ),
        )}
        {page < pageCount ? (
          <Link href={pageHref(page + 1, { q, category, measured })} className={idle}>
            Next
          </Link>
        ) : (
          <span className={disabled}>Next</span>
        )}
        {page < pageCount ? (
          <Link href={pageHref(pageCount, { q, category, measured })} className={idle}>
            Last
          </Link>
        ) : (
          <span className={disabled}>Last</span>
        )}
      </div>
      <form method="GET" action="/profiles" className="flex items-center gap-2">
        {q ? <input type="hidden" name="q" value={q} /> : null}
        {category ? <input type="hidden" name="category" value={category} /> : null}
        {measured === 'no' ? <input type="hidden" name="measured" value="no" /> : null}
        <label htmlFor={`page-jump-${placement}`} className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
          Go to
        </label>
        <input
          id={`page-jump-${placement}`}
          name="page"
          type="number"
          min={1}
          max={pageCount}
          defaultValue={page}
          className="h-9 w-20 border border-[var(--line)] bg-[var(--canvas)] px-2 text-sm tabular-nums"
        />
        <button type="submit" className="btn-secondary !py-2 !px-3">
          Go
        </button>
      </form>
    </nav>
  );
}

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; scope?: string; page?: string; measured?: string }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams?.q || '';
  const category = resolvedParams?.category || '';
  const scope = resolvedParams?.scope || '';
  const measured = resolvedParams?.measured === 'no' ? 'no' : 'yes';
  const requestedPage = Math.max(1, Number(resolvedParams?.page) || 1);
  const limit = 25;

  let profiles: (ProfileDetail & { latestFollowerCount: number | null })[] = [];
  let total = 0;
  let measuredTotal = 0;
  let unmeasuredTotal = 0;
  let hasApiError = false;

  try {
    const res = await fetchProfiles({
      limit,
      offset: (requestedPage - 1) * limit,
      q: q || undefined,
      category: category || undefined,
      scope: scope || undefined,
      measured,
    });
    profiles = res.data;
    total = res.meta.total;
    measuredTotal = res.meta.measured ?? 0;
    unmeasuredTotal = res.meta.unmeasured ?? 0;
  } catch {
    hasApiError = true;
  }

  const pageCount = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(requestedPage, pageCount);
  const rangeStart = total === 0 ? 0 : (requestedPage - 1) * limit + 1;
  const rangeEnd = (requestedPage - 1) * limit + profiles.length;

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
          <h1 className="chart-title text-5xl sm:text-7xl text-[var(--ink)]">Saved profiles</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-3 max-w-2xl leading-relaxed">
            {measuredTotal.toLocaleString('en-US')} profiles have a published follower count from FastSocial
            Top Charts, CC BY 4.0, or a rounded figure on the IGshorts seed lists.
            {unmeasuredTotal > 0
              ? ` ${unmeasuredTotal.toLocaleString('en-US')} seed names were saved with the count left blank, and FastSocial does not include those handles.`
              : ''}
          </p>
          {total > 0 && (
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--ink-faint)]">
              Showing {rangeStart.toLocaleString('en-US')}–{rangeEnd.toLocaleString('en-US')}
            </p>
          )}
        </div>

        <form method="GET" action="/profiles" className="relative max-w-md mb-6">
          <Search className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2" />
          {category ? <input type="hidden" name="category" value={category} /> : null}
          {measured === 'no' ? <input type="hidden" name="measured" value="no" /> : null}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search the watchlist"
            className="w-full border border-[var(--line)] bg-[var(--surface)] pl-10 pr-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--ink)]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-0 mb-6 border border-[var(--ink)] w-fit">
          <Link
            href={pageHref(1, { q, category, measured: 'yes' })}
            className={`px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] ${
              measured === 'yes' ? 'bg-[var(--ink)] text-[var(--surface)]' : 'text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]'
            }`}
          >
            With a count{measuredTotal ? ` · ${measuredTotal.toLocaleString('en-US')}` : ''}
          </Link>
          <Link
            href={pageHref(1, { q, category, measured: 'no' })}
            className={`px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] ${
              measured === 'no' ? 'bg-[var(--ink)] text-[var(--surface)]' : 'text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]'
            }`}
          >
            Count not published{unmeasuredTotal ? ` · ${unmeasuredTotal.toLocaleString('en-US')}` : ''}
          </Link>
        </div>

        <div className="flex items-center gap-0 overflow-x-auto mb-6 border border-[var(--ink)] w-fit">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.value;
            const href = pageHref(1, {
              q,
              category: cat.value,
              measured,
            });

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

        {pageCount > 1 && (
          <div className="mb-4">
            <ProfilePager page={page} pageCount={pageCount} q={q} category={category} measured={measured} placement="top" />
          </div>
        )}

        {profiles.length > 0 ? (
          <ol className="border border-[var(--line)] bg-[var(--surface)]" start={rangeStart}>
            {profiles.map((profile, index) => (
              <li key={profile.igUsername} className="border-b border-[var(--line)] last:border-b-0">
                <Link
                  href={`/profiles/${profile.igUsername}`}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--canvas)]"
                >
                  <span className="w-10 shrink-0 text-right text-xs tabular-nums text-[var(--ink-faint)]">
                    {rangeStart + index}
                  </span>
                  <Avatar src={profile.avatarUrl} name={profile.displayName} size="sm" className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[15px] font-semibold text-[var(--ink)]">{profile.displayName}</h2>
                    <p className="truncate text-xs text-[var(--ink-muted)]">@{profile.igUsername}</p>
                  </div>
                  <div className="hidden max-w-[240px] text-right text-[10px] uppercase tracking-wider text-[var(--ink-faint)] sm:block">
                    <p className="truncate">{profile.category || profile.entityType || 'Profile'}</p>
                    <p className="truncate">
                      {[profile.countryRegion, sourceLabel(profile.source)].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="w-16 shrink-0 text-right">
                    {profile.latestFollowerCount !== null ? (
                      <div className="text-base font-semibold tabular-nums">
                        <FollowerCount count={profile.latestFollowerCount} />
                      </div>
                    ) : (
                      <span className="text-[11px] uppercase tracking-wider text-[var(--ink-faint)]">Not published</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <div className="border border-[var(--line)] bg-[var(--surface)] py-16 text-center text-sm text-[var(--ink-muted)]">
            {measured === 'yes'
              ? 'No profile with a published count matches that search.'
              : 'No blank-count profile matches that search.'}
          </div>
        )}

        {pageCount > 1 && (
          <div className="mt-4">
            <ProfilePager page={page} pageCount={pageCount} q={q} category={category} measured={measured} placement="bottom" />
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
