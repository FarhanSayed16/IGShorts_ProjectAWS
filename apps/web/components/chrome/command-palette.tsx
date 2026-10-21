'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { fetchProfiles } from '@/lib/api/client';

const SHORTCUTS = [
  { label: 'Global 100', href: '/charts/global' },
  { label: 'India 100', href: '/charts/india' },
  { label: 'Movers', href: '/movers' },
  { label: 'Watchlist', href: '/profiles' },
  { label: 'Methodology', href: '/methodology' },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<{ igUsername: string; displayName: string }[]>([]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setHits([]);
      return;
    }
    const handle = window.setTimeout(async () => {
      try {
        const res = await fetchProfiles({ q: query.trim(), limit: 8, offset: 0 });
        setHits(
          res.data.map((row) => ({ igUsername: row.igUsername, displayName: row.displayName })),
        );
      } catch {
        setHits([]);
      }
    }, 200);
    return () => window.clearTimeout(handle);
  }, [open, query]);

  const filteredShortcuts = useMemo(
    () => SHORTCUTS.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 px-4 py-24 flex justify-center items-start"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-[var(--surface)] border border-[var(--ink)] overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--line)]">
          <Search className="w-4 h-4 text-[var(--ink)]" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people or charts"
            className="flex-1 bg-transparent text-sm outline-none text-[var(--ink)] placeholder:text-[var(--ink-faint)]"
          />
          <kbd className="text-[10px] uppercase tracking-wider text-[var(--ink-faint)]">Esc</kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto py-1 text-sm">
          {hits.map((hit) => (
            <li key={hit.igUsername}>
              <button
                className="w-full text-left px-4 py-2.5 hover:bg-[var(--canvas)] flex items-center justify-between"
                onClick={() => {
                  setOpen(false);
                  router.push(`/profiles/${hit.igUsername}`);
                }}
              >
                <span className="font-semibold">{hit.displayName}</span>
                <span className="text-xs text-[var(--ink-muted)]">@{hit.igUsername}</span>
              </button>
            </li>
          ))}

          {filteredShortcuts.map((item) => (
            <li key={item.href}>
              <button
                className="w-full text-left px-4 py-2.5 hover:bg-[var(--canvas)] text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center justify-between"
                onClick={() => {
                  setOpen(false);
                  router.push(item.href);
                }}
              >
                <span className="uppercase tracking-wider text-xs font-bold">{item.label}</span>
                <span className="text-[11px] text-[var(--ink-faint)]">{item.href}</span>
              </button>
            </li>
          ))}

          {query.trim().length >= 2 && hits.length === 0 && filteredShortcuts.length === 0 && (
            <li className="px-4 py-6 text-center text-xs text-[var(--ink-muted)]">
              No results for “{query}”
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
