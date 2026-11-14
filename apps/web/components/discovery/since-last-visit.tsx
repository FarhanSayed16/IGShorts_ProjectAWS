'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { VisitDiff } from '@igshorts/shared';
import { fetchVisitDiff } from '@/lib/api/client';
import { readMemberToken } from '@/lib/member-session';

const STORAGE_KEY = 'igshorts-last-visit';

export function SinceLastVisit() {
  const [mode, setMode] = useState<'loading' | 'welcome' | 'diff' | 'hidden'>('loading');
  const [diff, setDiff] = useState<VisitDiff | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const previous = localStorage.getItem(STORAGE_KEY);
      if (!previous) {
        if (!cancelled) setMode('welcome');
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
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
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
        const token = readMemberToken();
        if (token) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '/api/v1'}/members/me/visit`, {
            method: 'PATCH',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }).catch(() => undefined);
        }
      }
    }

    run();
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
          <ul className="mt-4 space-y-2 text-sm">
            {diff && diff.newTrendTopics > 0 && (
              <li>
                <Link href="/trending" className="hover:underline">
                  {diff.newTrendTopics} new trending topic{diff.newTrendTopics === 1 ? '' : 's'}
                </Link>
              </li>
            )}
            {diff && diff.newMusicTracks > 0 && (
              <li>
                <Link href="/music" className="hover:underline">
                  {diff.newMusicTracks} new music track{diff.newMusicTracks === 1 ? '' : 's'}
                </Link>
              </li>
            )}
            {diff && diff.newProfiles > 0 && (
              <li>
                <Link href="/profiles" className="hover:underline">
                  {diff.newProfiles} new profile{diff.newProfiles === 1 ? '' : 's'} in the saved index
                </Link>
              </li>
            )}
            {diff?.creatorMoves.slice(0, 4).map((move) => (
              <li key={move.username}>
                <Link href={`/profiles/${move.username}`} className="hover:underline">
                  {move.displayName} moved {move.direction} ({move.delta > 0 ? '+' : ''}
                  {move.delta})
                </Link>
              </li>
            ))}
            {diff?.significantStories.slice(0, 3).map((story) => (
              <li key={story.title}>
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
