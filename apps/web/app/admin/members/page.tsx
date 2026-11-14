'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, UserRound } from 'lucide-react';
import { getAdminMembers } from '@/lib/api/admin-client';

export default function AdminMembersPage() {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      email: string;
      createdAt: string;
      lastVisitedAt: string | null;
      trackCount: number;
    }>
  >([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminMembers({ limit, offset, q: q || undefined });
      setRows(res.data);
      setTotal(res.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [offset, q]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--brand-slate)]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00d26a] mb-2">
            Members
          </p>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Members
          </h1>
          <p className="text-xs text-[var(--neutral-400)] mt-1.5">
            Support lookup — email, last visit, tracked profiles. No messaging CRM.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--brand-slate)] text-white border border-white/10 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00d26a]' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => {
            setOffset(0);
            setQ(e.target.value);
          }}
          placeholder="Search email"
          className="px-3 py-2 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-xs text-white min-w-[220px]"
        />
        <span className="text-xs text-[var(--neutral-500)] self-center">{total} members</span>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-rose-800/60 bg-rose-950/40 text-rose-200 text-xs">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-[var(--brand-slate)] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-black/40 text-[var(--neutral-400)] border-b border-[var(--brand-slate)]">
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Email</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Created</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">
                Last visit
              </th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Tracks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--brand-slate)]/50">
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-[var(--neutral-500)]">
                  <UserRound className="w-6 h-6 mx-auto mb-2 text-[#00d26a]" />
                  No members found.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-white/5">
                <td className="py-3 px-4 text-white font-mono">{row.email}</td>
                <td className="py-3 px-4 text-[var(--neutral-400)]">
                  {new Date(row.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-[var(--neutral-400)]">
                  {row.lastVisitedAt ? new Date(row.lastVisitedAt).toLocaleString() : '—'}
                </td>
                <td className="py-3 px-4 text-white font-mono">{row.trackCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={offset === 0}
          onClick={() => setOffset(Math.max(0, offset - limit))}
          className="px-3 py-2 text-xs border border-white/20 rounded-xl disabled:opacity-40 cursor-pointer"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={offset + limit >= total}
          onClick={() => setOffset(offset + limit)}
          className="px-3 py-2 text-xs border border-white/20 rounded-xl disabled:opacity-40 cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
