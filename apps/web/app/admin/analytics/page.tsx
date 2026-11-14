'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, AlertTriangle } from 'lucide-react';
import { getAdminAnalyticsSummary } from '@/lib/api/admin-client';

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Page views',
  profile_view: 'Profile views',
  chart_view: 'Chart views',
  music_preview: 'Music previews',
  search: 'Searches',
};

export default function AdminAnalyticsPage() {
  const [total, setTotal] = useState(0);
  const [byType, setByType] = useState<Record<string, number>>({});
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminAnalyticsSummary();
      setTotal(data.total ?? 0);
      setByType(data.byType ?? {});
      setAvailable(data.available !== false);
    } catch (err) {
      setTotal(0);
      setByType({});
      setAvailable(false);
      setError(err instanceof Error ? err.message : 'Analytics summary unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = Object.keys(EVENT_LABELS).map((key) => ({
    key,
    label: EVENT_LABELS[key],
    count: byType[key] ?? 0,
  }));

  const empty = !loading && (total === 0 || !available);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="pb-6 border-b border-[var(--brand-slate)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00d26a] mb-2">
          Analytics
        </p>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
          Analytics
        </h1>
        <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
          Consent-gated first-party events only. Admin paths are never recorded.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--neutral-400)]">Loading event counts…</p>
      ) : empty ? (
        <div className="p-8 rounded-2xl border border-dashed border-white/20 bg-black/30 text-center space-y-3">
          <BarChart3 className="w-8 h-8 text-[#00d26a] mx-auto" />
          <p className="text-sm text-[var(--neutral-300)]">No events yet</p>
          <p className="text-xs text-[var(--neutral-500)] max-w-sm mx-auto leading-relaxed">
            Counts appear after visitors opt into analytics cookies and browse non-admin pages.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--brand-slate)] flex items-center justify-between">
            <h2 className="text-sm font-display font-bold text-white">Event counts</h2>
            <span className="text-xs font-mono text-[#00d26a]">{total} total</span>
          </div>
          <ul className="divide-y divide-[var(--brand-slate)]">
            {rows.map((row) => (
              <li
                key={row.key}
                className="flex items-center justify-between px-5 py-3.5 text-sm text-[var(--neutral-200)]"
              >
                <span>{row.label}</span>
                <span className="font-mono text-[#00d26a]">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
