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
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
          Provider Sync & Daily Pipeline
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Pull due watchlist metrics from the configured provider, then rebuild ranks. v1 uses the
          seed adapter — Meta Graph stays off until App Review.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Sync due profiles</h2>
              <p className="text-xs text-slate-400 mt-1">
                Calls the ingestion adapter. Seed mode does not overwrite existing counts with null.
              </p>
            </div>
            <RefreshCw className="w-5 h-5 text-blue-400" />
          </div>
          <button
            onClick={() => run('sync')}
            disabled={isRunning}
            className="w-full py-2.5 px-4 rounded-lg bg-[var(--color-navy)] text-white text-xs font-semibold border border-[var(--color-navy-2)] disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2 justify-center">
              <Play className="w-3.5 h-3.5 text-[var(--color-gold)]" />
              {isRunning && mode === 'sync' ? 'Syncing…' : 'Run watchlist sync'}
            </span>
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Daily pipeline</h2>
              <p className="text-xs text-slate-400 mt-1">
                Sync, then rebuild Global and India charts. Same path as cron / EventBridge.
              </p>
            </div>
            <Activity className="w-5 h-5 text-[var(--color-gold)]" />
          </div>
          <button
            onClick={() => run('pipeline')}
            disabled={isRunning}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800 text-white text-xs font-semibold border border-slate-700 disabled:opacity-50"
          >
            {isRunning && mode === 'pipeline' ? 'Running pipeline…' : 'Run daily pipeline'}
          </button>
        </div>
      </div>

      {report && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Last run report</h2>
          </div>
          <pre className="text-[11px] font-mono text-slate-300 bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
