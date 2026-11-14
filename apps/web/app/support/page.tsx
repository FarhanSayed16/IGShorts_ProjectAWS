'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Mail, Bug, Database, UserRound, Scale } from 'lucide-react';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';

const CATEGORIES = [
  {
    id: 'bug',
    label: 'Bug report',
    icon: Bug,
    subject: 'Bug report',
    hint: 'Something broken on charts, profiles, or playback.',
  },
  {
    id: 'data',
    label: 'Data correction',
    icon: Database,
    subject: 'Data correction',
    hint: 'Wrong handle, name, region, or follower snapshot.',
  },
  {
    id: 'account',
    label: 'Account',
    icon: UserRound,
    subject: 'Account help',
    hint: 'Sign-in, saved profiles, or account deletion.',
  },
  {
    id: 'legal',
    label: 'Legal',
    icon: Scale,
    subject: 'Legal inquiry',
    hint: 'Privacy, takedown, or rights questions.',
  },
] as const;

export default function SupportPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('bug');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const selected = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];

  const mailtoHref = useMemo(() => {
    const body = [
      `Category: ${selected.label}`,
      name ? `From: ${name}` : null,
      '',
      message || '(describe the issue)',
    ]
      .filter(Boolean)
      .join('\n');
    return `mailto:support@igshorts.com?subject=${encodeURIComponent(
      `[IGshorts] ${selected.subject}`,
    )}&body=${encodeURIComponent(body)}`;
  }, [selected, name, message]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-[720px] mx-auto w-full px-4 sm:px-6 py-12">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00d26a] mb-3">
          Support
        </p>
        <h1 className="chart-title text-5xl sm:text-7xl mb-4">Contact</h1>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-8 max-w-xl">
          Pick a category and open your mail client. Messages go to{' '}
          <span className="font-mono text-[var(--ink)]">support@igshorts.com</span>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {CATEGORIES.map((item) => {
            const Icon = item.icon;
            const active = item.id === category;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={`text-left p-4 border transition-colors cursor-pointer ${
                  active
                    ? 'border-[#00d26a] bg-[#00d26a]/10'
                    : 'border-[var(--line)] hover:border-[var(--ink)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${active ? 'text-[#00d26a]' : 'text-[var(--ink-muted)]'}`} />
                  <span className="text-sm font-bold">{item.label}</span>
                </div>
                <p className="text-xs text-[var(--ink-muted)]">{item.hint}</p>
              </button>
            );
          })}
        </div>

        <form
          className="space-y-4 border border-[var(--line)] p-6 bg-[var(--surface)]"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = mailtoHref;
          }}
        >
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] mb-1.5">
              Your name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-[var(--canvas)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[#00d26a]"
              placeholder="Name or handle"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] mb-1.5">
              Message
            </label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-[var(--canvas)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[#00d26a] resize-y"
              placeholder="What should we look at?"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] bg-black text-white hover:bg-[#00d26a] hover:text-black transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              Open email
            </button>
            <a
              href={mailtoHref}
              className="text-xs font-semibold underline underline-offset-4 text-[var(--ink-muted)]"
            >
              Or use mailto link
            </a>
          </div>
        </form>

        <p className="mt-8 text-xs text-[var(--ink-muted)]">
          Looking for answers first? Visit the{' '}
          <Link href="/help" className="underline underline-offset-4 font-semibold text-[var(--ink)]">
            Help Center
          </Link>
          .
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}
