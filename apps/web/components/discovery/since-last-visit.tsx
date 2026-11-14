'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { VisitDiff } from '@igshorts/shared';
import { fetchVisitDiff } from '@/lib/api/client';
import { memberFetch, readMemberToken } from '@/lib/member-session';
import { canUsePreferenceStorage } from '@/lib/consent/consent-guard';

const STORAGE_KEY = 'igshorts-last-visit';

function readLocalVisit(): string | null {
  try {
    if (!canUsePreferenceStorage()) return null;
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeLocalVisit(iso: string) {
  try {
    if (!canUsePreferenceStorage()) return;
    localStorage.setItem(STORAGE_KEY, iso);
  } catch {
    // Private mode / blocked storage — ignore.
  }
}

function ChangeCount({ count, label }: { count: number; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-display text-lg leading-none text-[var(--ink)] tabular-nums">
        +{count}
      </span>
      <span>{label}</span>
    </span>
  );
}

export function SinceLastVisit() {
  const [mode, setMode] = useState<'loading' | 'welcome' | 'diff' | 'hidden'>('loading');
  const [diff, setDiff] = useState<VisitDiff | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      let previous = readLocalVisit();
      const token = readMemberToken();

      if (token) {
        try {
          const me = (await memberFetch('/members/me')) as {
            user?: { lastVisitedAt?: string | null };
          };
          if (me.user?.lastVisitedAt) {
            previous = me.user.lastVisitedAt;
          }
        } catch {
          // Fall back to localStorage when member session is unavailable.
        }
      }

      if (!previous) {
        if (!cancelled) setMode('welcome');
        writeLocalVisit(new Date().toISOString());
        if (token) {
          memberFetch('/members/me/visit', { method: 'PATCH' }).catch(() => undefined);
        }
        return;
      }

      try {
        const result = await fetchVisitDiff(previous);
        if (cancelled) return;
        const hasSignal =
          result.newTrendTopics > 0 ||
          result.newMusicTracks > 0 ||
          result.newProfiles > 0 ||
          result.creatorMoves.length > 0 ||
          result.significantStories.length > 0;
        setDiff(result);
        setMode(hasSignal ? 'diff' : 'hidden');
      } catch {
        if (!cancelled) setMode('hidden');
      } finally {
        writeLocalVisit(new Date().toISOString());
        if (token) {
          memberFetch('/members/me/visit', { method: 'PATCH' }).catch(() => undefined);
        }
      }
    }

    run().catch(() => {
      if (!cancelled) setMode('hidden');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (mode === 'loading' || mode === 'hidden') return null;

  return (
    <section className="mb-14 border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 relative">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink)]"
        onClick={() => setMode('hidden')}
      >
        Dismiss
      </button>
      {mode === 'welcome' ? (
        <div>
          <h2 className="chart-title text-2xl sm:text-3xl">Welcome to IGshorts</h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Here is what is trending right now. Come back later to see what changed since your last visit.
          </p>
          <Link href="/trending" className="inline-block mt-4 text-[11px] font-bold uppercase tracking-wider hover:underline">
            Explore trending →
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="chart-title text-2xl sm:text-3xl">Since your last visit</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {diff && diff.newTrendTopics > 0 && (
              <li>
                <Link href="/trending" className="hover:underline inline-flex items-center gap-2">
                  <ChangeCount
                    count={diff.newTrendTopics}
                    label={`new trending topic${diff.newTrendTopics === 1 ? '' : 's'}`}
                  />
                </Link>
              </li>
            )}
            {diff && diff.newMusicTracks > 0 && (
              <li>
                <Link href="/music" className="hover:underline inline-flex items-center gap-2">
                  <ChangeCount
                    count={diff.newMusicTracks}
                    label={`new music track${diff.newMusicTracks === 1 ? '' : 's'}`}
                  />
                </Link>
              </li>
            )}
            {diff && diff.newProfiles > 0 && (
              <li>
                <Link href="/profiles" className="hover:underline inline-flex items-center gap-2">
                  <ChangeCount
                    count={diff.newProfiles}
                    label={`new profile${diff.newProfiles === 1 ? '' : 's'} in the saved index`}
                  />
                </Link>
              </li>
            )}
            {diff?.creatorMoves.slice(0, 4).map((move) => {
              const up = move.direction === 'up';
              return (
                <li key={`${move.username}-${move.direction}-${move.delta}`}>
                  <Link
                    href={`/profiles/${move.username}`}
                    className="hover:underline inline-flex items-center gap-2"
                  >
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 border ${
                        up
                          ? 'border-[var(--up)] text-[var(--up)] bg-[var(--up-bg)]'
                          : 'border-[var(--danger)] text-[var(--danger)] bg-[var(--danger-bg)]'
                      }`}
                      aria-hidden="true"
                    >
                      {up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    </span>
                    <span>
                      {move.displayName} moved {move.direction}{' '}
                      <span className="font-mono tabular-nums">
                        ({move.delta > 0 ? '+' : ''}
                        {move.delta})
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
            {diff?.significantStories.slice(0, 3).map((story, index) => (
              <li key={`${story.category}-${story.title}-${index}`}>
                <Link href="/trending" className="hover:underline">
                  {story.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
