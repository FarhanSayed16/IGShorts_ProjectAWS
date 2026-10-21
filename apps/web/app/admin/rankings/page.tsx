'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Play, CheckCircle2, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { triggerRebuildRankings, getAdminRankingRuns } from '@/lib/api/admin-client';
import { ConfirmDialog } from '@/components/chrome/confirm-dialog';
import { CHART_KEYS } from '@igshorts/shared';

export default function AdminRankingsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [pendingRebuild, setPendingRebuild] = useState<string | 'all' | null>(null);

  const loadRuns = async () => {
    try {
      const res = await getAdminRankingRuns();
      setRuns(res);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const handleRebuild = async (chartKey?: string) => {
    setIsRunning(true);
    setMessage('');
    try {
      await triggerRebuildRankings(chartKey);
      setMessage(`Ranking run completed successfully for ${chartKey || 'all leaderboards'}.`);
      await loadRuns();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Ranking rebuild failed.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={!!pendingRebuild}
        title="Rebuild rankings?"
        body="This recomputes competition ranks from the latest non-null follower snapshots. Hidden and unranked people stay off the public charts."
        confirmLabel="Rebuild"
        onCancel={() => setPendingRebuild(null)}
        onConfirm={() => {
          const key = pendingRebuild === 'all' ? undefined : pendingRebuild || undefined;
          setPendingRebuild(null);
          void handleRebuild(key);
        }}
      />
      <div className="pb-6 border-b border-[var(--brand-slate)]">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
          Rankings Engine Pipeline
        </h1>
        <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
          Execute the <code>followers_v1</code> competition ranking algorithm, computing ranks and
          deltas vs previous runs.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800 text-blue-200 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button
            onClick={() => setMessage('')}
            className="font-bold text-blue-400 hover:text-blue-200 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Trigger Controls */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] shadow-lg space-y-4">
        <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider">
          Manual Algorithm Triggers
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setPendingRebuild('all')}
            disabled={isRunning}
            className="py-3 px-5 rounded-xl bg-[var(--brand-accent)] hover:opacity-95 text-[var(--brand-deep)] text-xs font-display font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_4px_16px_rgba(212,168,67,0.2)] disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Rebuild All Charts</span>
          </button>

          <button
            onClick={() => setPendingRebuild(CHART_KEYS.GLOBAL_PERSONS)}
            disabled={isRunning}
            className="py-3 px-5 rounded-xl bg-[var(--brand-slate)] hover:bg-[var(--brand-slate)]/80 text-white text-xs font-display font-bold uppercase tracking-wider border border-[var(--neutral-700)]/60 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Global Persons Only</span>
          </button>

          <button
            onClick={() => setPendingRebuild(CHART_KEYS.INDIA_PERSONS)}
            disabled={isRunning}
            className="py-3 px-5 rounded-xl bg-[var(--brand-slate)] hover:bg-[var(--brand-slate)]/80 text-white text-xs font-display font-bold uppercase tracking-wider border border-[var(--neutral-700)]/60 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span>India Persons Only</span>
          </button>
        </div>
      </div>

      {/* Historical Runs Table */}
      <div className="rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] overflow-hidden shadow-lg">
        <div className="p-4 sm:p-5 border-b border-[var(--brand-slate)] flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--neutral-400)]">
            Recent Ranking Runs
          </h3>
          <button
            onClick={loadRuns}
            className="text-xs text-[var(--neutral-400)] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--brand-slate)] bg-[var(--brand-deep)] text-[var(--neutral-400)]">
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Run ID
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Chart Key
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Algorithm
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Ranked Count
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Status
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">
                  Finished
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-slate)]/50">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-[var(--brand-slate)]/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[var(--neutral-400)] text-[11px]">
                    {run.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{run.chartKey}</td>
                  <td className="py-3.5 px-4 font-mono text-[var(--neutral-400)]">
                    {run.algorithmVersion}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-white">{run.profileCount}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm">
                      {run.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[var(--neutral-400)] text-[11px]">
                    {run.finishedAt ? new Date(run.finishedAt).toLocaleString() : 'In progress'}
                  </td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--neutral-500)]">
                    No recorded runs found. Trigger a rebuild to populate.
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
