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
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
          Rankings Engine Pipeline
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Execute the <code>followers_v1</code> competition ranking algorithm, computing ranks and
          deltas vs previous runs.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800 text-blue-200 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold text-blue-400">
            ✕
          </button>
        </div>
      )}

      {/* Trigger Controls */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-white">Manual Algorithm Triggers</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setPendingRebuild('all')}
            disabled={isRunning}
            className="py-2.5 px-4 rounded-lg bg-navy hover:bg-navy-2 text-white text-xs font-semibold border border-navy-2 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-gold" />
            <span>Rebuild All Charts</span>
          </button>

          <button
            onClick={() => setPendingRebuild(CHART_KEYS.GLOBAL_PERSONS)}
            disabled={isRunning}
            className="py-2.5 px-4 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Global Persons Only</span>
          </button>

          <button
            onClick={() => setPendingRebuild(CHART_KEYS.INDIA_PERSONS)}
            disabled={isRunning}
            className="py-2.5 px-4 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-gold" />
            <span>India Persons Only</span>
          </button>
        </div>
      </div>

      {/* Historical Runs Table */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent Ranking Runs
          </h3>
          <button
            onClick={loadRuns}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">Run ID</th>
                <th className="py-3 px-4 font-semibold">Chart Key</th>
                <th className="py-3 px-4 font-semibold">Algorithm</th>
                <th className="py-3 px-4 font-semibold">Ranked Count</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Finished</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{run.id}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">{run.chartKey}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{run.algorithmVersion}</td>
                  <td className="py-3 px-4 font-mono text-slate-200">{run.profileCount}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {run.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">
                    {run.finishedAt ? new Date(run.finishedAt).toLocaleString() : 'In progress'}
                  </td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
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
