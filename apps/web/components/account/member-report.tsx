'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CountLine } from '@/components/account/count-line';
import { FollowerCount } from '@/components/rank/follower-count';
import { memberFetch, readMemberToken } from '@/lib/member-session';

interface HistoryRow {
  observedAt: string;
  followerCount: number | null;
}

interface Report {
  followerCount: number | null;
  observedAt: string | null;
  tracked: boolean;
  history: HistoryRow[];
}

function formatCheckDate(value: string | null): string {
  if (!value) return 'No stored count yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No stored count yet';
  return `Checked ${date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

const LockedPanel: React.FC<{ username: string }> = ({ username }) => {
  const next = `/account?next=${encodeURIComponent(`/profiles/${username}`)}`;
  return (
    <section className="relative mb-8 overflow-hidden border border-[var(--line)] bg-[var(--surface)]">
      <div className="pointer-events-none select-none p-6 blur-md" aria-hidden="true">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-faint)] mb-2">
              Stored count
            </span>
            <p className="font-display text-5xl leading-none">000.0M</p>
            <p className="mt-2 text-xs text-[var(--ink-muted)]">Checked 00 0000 0000</p>
          </div>
          <span className="btn-primary text-xs">Track</span>
        </div>
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-[var(--ink-faint)]">
              <th className="py-2 font-semibold">Date</th>
              <th className="py-2 font-semibold">Count</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[var(--line)]">
              <td className="py-2">00 0000 0000</td>
              <td className="py-2">000.0M</td>
            </tr>
            <tr className="border-t border-[var(--line)]">
              <td className="py-2">00 0000 0000</td>
              <td className="py-2">000.0M</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--surface)]/72 px-6 text-center">
        <p className="max-w-sm text-sm text-[var(--ink)]">
          The audience group above stays public. The stored count, the check date, the history, and Track open with an account.
        </p>
        <Link href={next} className="btn-primary text-xs">
          Sign in to view this
        </Link>
      </div>
    </section>
  );
};

export const MemberReport: React.FC<{ username: string }> = ({ username }) => {
  const [signedIn, setSignedIn] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!readMemberToken()) {
      setSignedIn(false);
      setReport(null);
      setError(null);
      setLoading(false);
      return;
    }
    setSignedIn(true);
    setLoading(true);
    try {
      const data = (await memberFetch(`/members/profiles/${encodeURIComponent(username)}`)) as Report;
      setReport(data);
      setError(null);
    } catch (err) {
      setReport(null);
      setError(err instanceof Error ? err.message : 'Could not load the stored count');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const onChange = () => void load();
    window.addEventListener('igshorts-member', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('igshorts-member', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [username]);

  const toggleTrack = async () => {
    if (!report) return;
    setBusy(true);
    setError(null);
    try {
      if (report.tracked) {
        await memberFetch(`/members/tracks/${encodeURIComponent(username)}`, { method: 'DELETE' });
      } else {
        await memberFetch('/members/tracks', {
          method: 'POST',
          body: JSON.stringify({ username }),
        });
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Track could not be saved');
    } finally {
      setBusy(false);
    }
  };

  if (!signedIn) {
    return <LockedPanel username={username} />;
  }

  if (loading && !report) {
    return (
      <section className="mb-8 bg-[var(--surface)] border border-[var(--line)] p-6">
        <p className="text-sm text-[var(--ink-muted)]">Loading the stored count…</p>
      </section>
    );
  }

  return (
    <section className="mb-8 bg-[var(--surface)] border border-[var(--line)] p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-faint)] mb-2">
            Stored count
          </span>
          {report?.followerCount != null ? (
            <FollowerCount count={report.followerCount} size="lg" className="!text-5xl !leading-none font-display" />
          ) : (
            <p className="font-display text-3xl leading-none">No stored count yet</p>
          )}
          <p className="mt-2 text-xs text-[var(--ink-muted)]">{formatCheckDate(report?.observedAt ?? null)}</p>
        </div>
        <button type="button" className="btn-primary text-xs" disabled={busy || !report} onClick={toggleTrack}>
          {report?.tracked ? 'Stop tracking' : 'Track'}
        </button>
      </div>
      {report && <CountLine history={report.history} />}
      {error && (
        <p role="alert" className="mt-3 border border-[var(--danger)] bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}
      {report && report.history.length > 0 && (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-[var(--ink-faint)]">
              <th className="py-2 font-semibold">Date</th>
              <th className="py-2 font-semibold">Count</th>
            </tr>
          </thead>
          <tbody>
            {report.history.map((row) => (
              <tr key={row.observedAt} className="border-t border-[var(--line)]">
                <td className="py-2">
                  {new Date(row.observedAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </td>
                <td className="py-2">
                  <FollowerCount count={row.followerCount} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};
