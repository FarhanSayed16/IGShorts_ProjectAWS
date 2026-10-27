'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { FollowerCount } from '@/components/rank/follower-count';
import { memberFetch, writeMemberToken } from '@/lib/member-session';
import { useMemberSession } from '@/lib/use-member-session';

interface TrackRow {
  username: string;
  displayName: string;
  followerCount: number | null;
  observedAt: string | null;
}

function safeReturnPath(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
  return value;
}

function accountError(err: unknown, mode: 'signup' | 'login'): string {
  const raw = err instanceof Error ? err.message : '';
  const message = raw.toLowerCase();
  if (message.includes('already exists')) {
    return 'An account with this email already exists. Sign in instead.';
  }
  if (
    message.includes('at least 8') ||
    message.includes('longer than') ||
    message.includes('minlength') ||
    message.includes('too short')
  ) {
    return 'Password must be at least 8 characters.';
  }
  if (message.includes('invalid email or password')) {
    return 'That email and password do not match.';
  }
  if (message.includes('email')) {
    return 'Enter a valid email address.';
  }
  if (raw) return raw;
  return mode === 'signup' ? 'Could not create the account.' : 'Could not sign in.';
}

function AccountPanel() {
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get('next'));
  const { email: signedInEmail, ready, signOut } = useMemberSession();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tracks, setTracks] = useState<TrackRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!signedInEmail) {
      setTracks([]);
      return;
    }
    let cancelled = false;
    memberFetch('/members/tracks')
      .then((list) => {
        if (!cancelled) setTracks((list as { tracks: TrackRow[] }).tracks);
      })
      .catch(() => {
        if (!cancelled) setTracks([]);
      });
    return () => {
      cancelled = true;
    };
  }, [signedInEmail]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      setNotice(null);
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const path = mode === 'signup' ? '/members/signup' : '/members/login';
      const result = (await memberFetch(path, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })) as { accessToken: string };
      writeMemberToken(result.accessToken);
      setPassword('');
      setNotice(mode === 'signup' ? 'Account created.' : 'Signed in.');
    } catch (err) {
      setError(accountError(err, mode));
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Delete this email account and its tracked profiles?')) return;
    setBusy(true);
    try {
      await memberFetch('/members/me', { method: 'DELETE' });
      setNotice(null);
      signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the account');
    } finally {
      setBusy(false);
    }
  };

  const backLabel = returnTo?.startsWith('/profiles/') ? 'Back to profile' : 'Continue';

  if (!ready) {
    return (
      <main id="main-content" className="flex-1 max-w-[720px] mx-auto w-full px-4 sm:px-6 py-12 text-sm text-[var(--ink-muted)]">
        Loading account…
      </main>
    );
  }

  return (
    <main id="main-content" className="flex-1 max-w-[720px] mx-auto w-full px-4 sm:px-6 py-12">
      <h1 className="chart-title text-5xl sm:text-6xl mb-3">Account</h1>
      <p className="text-sm text-[var(--ink-muted)] mb-8 max-w-xl">
        An email account shows the stored follower count, lets you track a saved profile, and
        keeps that history. The audience group stays visible without an account. This login does
        not prove you own the Instagram handle, and we never ask for an Instagram password.
      </p>

      {signedInEmail ? (
        <section className="bg-[var(--surface)] border border-[var(--line)] p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">Session</p>
            <h2 className="mt-2 font-display text-3xl text-[var(--ink)]">Signed in as</h2>
            <p className="mt-1 text-lg font-semibold break-all">{signedInEmail}</p>
            {notice && (
              <p className="mt-3 border border-[var(--up)] bg-[var(--up-bg)] px-3 py-2 text-sm text-[var(--up)]">
                {notice}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {returnTo && (
              <Link href={returnTo} className="btn-primary text-xs">
                {backLabel}
              </Link>
            )}
            <button type="button" className="btn-secondary text-xs" onClick={signOut}>
              Sign out
            </button>
            <button type="button" className="text-xs underline" disabled={busy} onClick={deleteAccount}>
              Delete account
            </button>
          </div>
          <div>
            <h2 className="chart-title text-2xl mb-3">Tracked profiles</h2>
            {tracks.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">None yet. Open a profile and choose Track.</p>
            ) : (
              <ul className="divide-y divide-[var(--line)] border border-[var(--line)]">
                {tracks.map((track) => (
                  <li key={track.username} className="flex items-center justify-between gap-4 px-4 py-3">
                    <Link href={`/profiles/${track.username}`} className="font-semibold">
                      {track.displayName}
                    </Link>
                    <FollowerCount count={track.followerCount} size="sm" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : (
        <form onSubmit={submit} className="bg-[var(--surface)] border border-[var(--line)] p-6 sm:p-8 max-w-md space-y-5">
          <div className="grid grid-cols-2 border border-[var(--line)]">
            <button
              type="button"
              aria-pressed={mode === 'signup'}
              className={`px-3 py-3 text-xs font-bold uppercase tracking-[0.14em] ${
                mode === 'signup' ? 'bg-[var(--ink)] text-[var(--surface)]' : 'text-[var(--ink-muted)]'
              }`}
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
            >
              Create account
            </button>
            <button
              type="button"
              aria-pressed={mode === 'login'}
              className={`px-3 py-3 text-xs font-bold uppercase tracking-[0.14em] border-l border-[var(--line)] ${
                mode === 'login' ? 'bg-[var(--ink)] text-[var(--surface)]' : 'text-[var(--ink-muted)]'
              }`}
              onClick={() => {
                setMode('login');
                setError(null);
              }}
            >
              Sign in
            </button>
          </div>
          <label className="block text-sm font-semibold" htmlFor="account-email">
            Email
            <input
              id="account-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full border border-[var(--line)] bg-[var(--canvas)] px-3 py-3 font-normal"
            />
          </label>
          <label className="block text-sm font-semibold" htmlFor="account-password">
            Password
            <input
              id="account-password"
              type="password"
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              aria-invalid={error?.includes('8 characters') ? true : undefined}
              aria-describedby="password-hint"
              onChange={(event) => setPassword(event.target.value)}
              className={`mt-1 w-full border bg-[var(--canvas)] px-3 py-3 font-normal ${
                error?.includes('8 characters') ? 'border-[var(--danger)]' : 'border-[var(--line)]'
              }`}
            />
            <span id="password-hint" className="mt-1 block text-xs font-normal text-[var(--ink-muted)]">
              At least 8 characters.
            </span>
          </label>
          {error && (
            <p role="alert" className="border border-[var(--danger)] bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary text-xs w-full" disabled={busy}>
            {busy ? 'Please wait' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
          <p className="text-xs text-[var(--ink-muted)]">
            See the <Link href="/privacy" className="underline">privacy note</Link>. You can delete the account later.
          </p>
        </form>
      )}
    </main>
  );
}

export default function AccountPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />
      <Suspense fallback={<main className="flex-1 max-w-[720px] mx-auto w-full px-4 py-12 text-sm">Loading account…</main>}>
        <AccountPanel />
      </Suspense>
      <PublicFooter />
    </div>
  );
}
