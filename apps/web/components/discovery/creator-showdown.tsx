'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/rank/avatar';

interface CreatorShowdownProps {
  creator1?: {
    rank: number;
    username: string;
    fullName: string;
    followersCount: number;
    avatarUrl?: string | null;
  };
  creator2?: {
    rank: number;
    username: string;
    fullName: string;
    followersCount: number;
    avatarUrl?: string | null;
  };
}

export function CreatorShowdown({ creator1, creator2 }: CreatorShowdownProps) {
  // Defaults based on verified database ranks if not passed
  const c1 = creator1 || {
    rank: 1,
    username: 'cristiano',
    fullName: 'Cristiano Ronaldo',
    followersCount: 679800000,
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg',
  };

  const c2 = creator2 || {
    rank: 2,
    username: 'leomessi',
    fullName: 'Lionel Messi',
    followersCount: 517700000,
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg',
  };

  const totalFollowers = c1.followersCount + c2.followersCount;
  const c1Percent = Math.round((c1.followersCount / totalFollowers) * 1000) / 10;
  const c2Percent = Math.round((c2.followersCount / totalFollowers) * 1000) / 10;
  const leadDiff = Math.abs(c1.followersCount - c2.followersCount);
  const formattedLead = `${(leadDiff / 1_000_000).toFixed(1)}M`;

  // Local interactive cheers with localStorage persistence
  const [c1Cheers, setC1Cheers] = useState<number>(1428);
  const [c2Cheers, setC2Cheers] = useState<number>(1382);
  const [hasCheered, setHasCheered] = useState<'c1' | 'c2' | null>(null);

  useEffect(() => {
    try {
      const savedC1 = localStorage.getItem('igshorts_cheer_c1');
      const savedC2 = localStorage.getItem('igshorts_cheer_c2');
      if (savedC1) setC1Cheers(Number(savedC1));
      if (savedC2) setC2Cheers(Number(savedC2));
    } catch {
      // Local storage unavailable
    }
  }, []);

  const cheer = (target: 'c1' | 'c2') => {
    if (target === 'c1') {
      const next = c1Cheers + 1;
      setC1Cheers(next);
      setHasCheered('c1');
      try {
        localStorage.setItem('igshorts_cheer_c1', String(next));
      } catch {}
    } else {
      const next = c2Cheers + 1;
      setC2Cheers(next);
      setHasCheered('c2');
      try {
        localStorage.setItem('igshorts_cheer_c2', String(next));
      } catch {}
    }
    setTimeout(() => setHasCheered(null), 1000);
  };

  return (
    <section aria-labelledby="showdown-title" className="mb-12">
      <div className="border-2 border-[var(--ink)] bg-[var(--surface)] p-4 sm:p-6 shadow-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-live-radar" />
            <h2 id="showdown-title" className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-[var(--ink)]">
              THE TITLE FIGHT: #1 VS #2
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2 py-0.5 bg-[var(--accent)] text-black font-bold uppercase">
              Lead: +{formattedLead}
            </span>
            <span className="text-[var(--ink-muted)]">Verified Billboard Census</span>
          </div>
        </div>

        {/* Head-to-Head Split View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Creator #1 (Left) */}
          <div className="flex items-center justify-between gap-4 p-4 bg-[var(--canvas)] border border-[var(--line)] hover-lift">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-display text-3xl sm:text-4xl font-black text-[var(--accent)]">
                #1
              </span>
              <Avatar src={c1.avatarUrl} name={c1.fullName} size="sm" rounded="full" />
              <div className="min-w-0">
                <Link
                  href={`/profiles/${c1.username}`}
                  className="font-display text-lg sm:text-xl font-bold uppercase text-[var(--ink)] hover:text-[var(--accent)] truncate block"
                >
                  {c1.fullName}
                </Link>
                <div className="font-mono text-xs text-[var(--ink-muted)]">
                  @{c1.username}
                </div>
                <div className="font-mono text-sm font-bold text-[var(--ink)] mt-1">
                  {(c1.followersCount / 1_000_000).toFixed(1)}M followers
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => cheer('c1')}
              aria-label={`Cheer ${c1.fullName}`}
              className={`flex-shrink-0 px-3 py-2 font-mono text-xs font-bold uppercase border transition-all ${
                hasCheered === 'c1'
                  ? 'bg-[var(--accent)] text-black border-[var(--accent)] scale-105'
                  : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--ink)]'
              }`}
            >
              🔥 Cheer ({c1Cheers.toLocaleString()})
            </button>
          </div>

          {/* Creator #2 (Right) */}
          <div className="flex items-center justify-between gap-4 p-4 bg-[var(--canvas)] border border-[var(--line)] hover-lift">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-display text-3xl sm:text-4xl font-black text-[var(--ink-muted)]">
                #2
              </span>
              <Avatar src={c2.avatarUrl} name={c2.fullName} size="sm" rounded="full" />
              <div className="min-w-0">
                <Link
                  href={`/profiles/${c2.username}`}
                  className="font-display text-lg sm:text-xl font-bold uppercase text-[var(--ink)] hover:text-[var(--accent)] truncate block"
                >
                  {c2.fullName}
                </Link>
                <div className="font-mono text-xs text-[var(--ink-muted)]">
                  @{c2.username}
                </div>
                <div className="font-mono text-sm font-bold text-[var(--ink)] mt-1">
                  {(c2.followersCount / 1_000_000).toFixed(1)}M followers
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => cheer('c2')}
              aria-label={`Cheer ${c2.fullName}`}
              className={`flex-shrink-0 px-3 py-2 font-mono text-xs font-bold uppercase border transition-all ${
                hasCheered === 'c2'
                  ? 'bg-[var(--accent)] text-black border-[var(--accent)] scale-105'
                  : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--ink)]'
              }`}
            >
              ⚡ Cheer ({c2Cheers.toLocaleString()})
            </button>
          </div>
        </div>

        {/* Live Tug-of-War Split Bar */}
        <div className="mt-6 pt-4 border-t border-[var(--line)]">
          <div className="flex justify-between items-center text-xs font-mono font-bold uppercase mb-2">
            <span className="text-[var(--accent)]">
              {c1.fullName.split(' ')[0]} {c1Percent}%
            </span>
            <span className="text-[var(--ink-muted)]">CROWD SHARE</span>
            <span className="text-[var(--ink-muted)]">
              {c2Percent}% {c2.fullName.split(' ')[0]}
            </span>
          </div>
          <div className="h-3 w-full bg-[var(--line)] flex overflow-hidden rounded-full">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-500 ease-out"
              style={{ width: `${c1Percent}%` }}
              title={`${c1.fullName}: ${c1Percent}%`}
            />
            <div
              className="h-full bg-[var(--ink-muted)] transition-all duration-500 ease-out"
              style={{ width: `${c2Percent}%` }}
              title={`${c2.fullName}: ${c2Percent}%`}
            />
          </div>
          <div className="mt-2 text-center text-[11px] font-mono text-[var(--ink-muted)]">
            Total Combined Audience: {(totalFollowers / 1_000_000_000).toFixed(2)} Billion Profiles
          </div>
        </div>
      </div>
    </section>
  );
}
