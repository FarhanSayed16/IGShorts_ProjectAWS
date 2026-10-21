'use client';

import React, { useState } from 'react';
import { RefreshCw, Play, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { triggerWatchlistSync, triggerDailyPipeline } from '@/lib/api/admin-client';

export default function AdminSyncPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [mode, setMode] = useState<'sync' | 'pipeline'>('sync');

  const run = async (kind: 'sync' | 'pipeline') => {
    setIsRunning(true);
    setErrorMsg('');
    setReport(null);
    setMode(kind);
    try {
      const res = kind === 'sync' ? await triggerWatchlistSync() : await triggerDailyPipeline();
      setReport(res as Record<string, unknown>);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Sync failed.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-6 border-b border-[var(--brand-slate)]">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
          Provider Sync & Daily Pipeline
        </h1>
        <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
          Pull due watchlist metrics from the configured provider, then rebuild ranks. v1 uses the
          seed adapter — Meta Graph stays off until App Review.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] shadow-lg space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-display font-bold text-white">Sync Due Profiles</h2>
              <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
                Calls the ingestion adapter. Seed mode does not overwrite existing counts with null.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <button
            onClick={() => run('sync')}
            disabled={isRunning}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white text-xs font-display font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-[0_4px_16px_rgba(2,132,199,0.25)] cursor-pointer"
          >
            <span className="inline-flex items-center gap-2 justify-center">
              <Play className="w-3.5 h-3.5 fill-current" />
              {isRunning && mode === 'sync' ? 'Syncing Profiles...' : 'Run Watchlist Sync'}
            </span>
          </button>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] shadow-lg space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-display font-bold text-white">Daily Pipeline</h2>
              <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
                Sync due profiles, then automatically recompute Global & India leaderboards.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <button
            onClick={() => run('pipeline')}
            disabled={isRunning}
            className="w-full py-3 px-4 rounded-xl bg-[var(--brand-slate)] hover:bg-[var(--brand-slate)]/80 text-white text-xs font-display font-bold uppercase tracking-wider border border-[var(--neutral-700)]/60 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span className="inline-flex items-center gap-2 justify-center">
              <Play className="w-3.5 h-3.5 fill-current text-[var(--brand-accent)]" />
              {isRunning && mode === 'pipeline' ? 'Executing Pipeline...' : 'Run Daily Pipeline'}
            </span>
          </button>
        </div>
      </div>

      {report && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] shadow-lg space-y-4">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-display font-bold text-white">Execution Run Report</h2>
          </div>
          <pre className="text-xs font-mono text-emerald-300 bg-[var(--brand-deep)] border border-[var(--brand-slate)] rounded-xl p-4 overflow-x-auto leading-relaxed">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
