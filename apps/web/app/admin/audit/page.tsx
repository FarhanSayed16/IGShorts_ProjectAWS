'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { getAdminAuditLogs } from '@/lib/api/admin-client';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadAudit = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminAuditLogs();
      setLogs(res);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (actionFilter && !String(log.action || '').toLowerCase().includes(actionFilter.toLowerCase())) {
        return false;
      }
      if (actorFilter && !String(log.actor || '').toLowerCase().includes(actorFilter.toLowerCase())) {
        return false;
      }
      const created = log.createdAt ? new Date(log.createdAt).getTime() : 0;
      if (dateFrom) {
        const from = new Date(dateFrom).getTime();
        if (created < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (created > to.getTime()) return false;
      }
      return true;
    });
  }, [logs, actionFilter, actorFilter, dateFrom, dateTo]);

  const exportCsv = () => {
    const header = ['createdAt', 'actor', 'action', 'entityType', 'summary'];
    const rows = filtered.map((log) =>
      [
        log.createdAt,
        log.actor,
        log.action,
        log.entityType || '',
        JSON.stringify(log.afterSummary || log.beforeSummary || ''),
      ]
        .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
        .join(','),
    );
    const blob = new Blob([[header.join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `igshorts-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--brand-slate)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Security & Operations Audit Trail
          </h1>
          <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
            Immutable log of administrative actions. Filter by action, actor, or date; export CSV.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--brand-slate)] text-[var(--neutral-200)] border border-[var(--neutral-700)]/60 cursor-pointer"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={loadAudit}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--brand-slate)] hover:bg-[var(--brand-slate)]/80 text-[var(--neutral-200)] border border-[var(--neutral-700)]/60 transition-all cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[var(--brand-accent)]' : ''}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          placeholder="Filter action"
          className="px-3 py-2 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-xs text-white"
        />
        <input
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          placeholder="Filter actor"
          className="px-3 py-2 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-xs text-white"
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-xs text-white"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-xs text-white"
        />
      </div>

      <div className="rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--brand-slate)] bg-[var(--brand-deep)] text-[var(--neutral-400)]">
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Timestamp
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Actor
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Action
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Target Entity
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-slate)]/50">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--brand-slate)]/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[var(--neutral-400)] text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-white font-medium">{log.actor}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--brand-deep)] border border-[var(--brand-accent)]/30 text-[var(--brand-accent)] shadow-sm">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[var(--neutral-400)] text-[11px]">
                    {log.entityType || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-[var(--neutral-200)] font-mono text-[11px]">
                    {log.afterSummary || log.beforeSummary || 'Operation executed'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--neutral-500)]">
                    No audit records match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
