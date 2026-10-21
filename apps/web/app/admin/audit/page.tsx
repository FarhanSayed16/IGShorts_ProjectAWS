'use client';

import React, { useEffect, useState } from 'react';
import { History, RefreshCw, ShieldCheck } from 'lucide-react';
import { getAdminAuditLogs } from '@/lib/api/admin-client';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--brand-slate)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Security & Operations Audit Trail
          </h1>
          <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
            Immutable log of all administrative actions, profile modifications, seed imports, and
            ranking executions.
          </p>
        </div>

        <button
          onClick={loadAudit}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--brand-slate)] hover:bg-[var(--brand-slate)]/80 text-[var(--neutral-200)] border border-[var(--neutral-700)]/60 transition-all cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[var(--brand-accent)]' : ''}`}
          />
          <span>Refresh</span>
        </button>
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
              {logs.map((log) => (
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
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--neutral-500)]">
                    No audit records logged yet.
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
