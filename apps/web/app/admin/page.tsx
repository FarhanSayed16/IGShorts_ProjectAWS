'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Trophy,
  Activity,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  getAdminOverview,
  triggerRebuildRankings,
  triggerSeedImport,
} from '@/lib/api/admin-client';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [isActionRunning, setIsActionRunning] = useState(false);

  const loadOverview = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminOverview();
      setData(res);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const handleRebuild = async () => {
    setIsActionRunning(true);
    setActionMessage('Triggering ranking engine rebuild...');
    try {
      await triggerRebuildRankings();
      setActionMessage('Rankings successfully recomputed for all leaderboards.');
      await loadOverview();
    } catch (err: unknown) {
      setActionMessage(err instanceof Error ? err.message : 'Ranking rebuild failed.');
    } finally {
      setIsActionRunning(false);
    }
  };

  const handleImport = async () => {
    setIsActionRunning(true);
    setActionMessage('Importing seed Excel file...');
    try {
      const res = await triggerSeedImport();
      setActionMessage(
        `Import complete: ${res.createdProfiles} created, ${res.mergedProfiles} merged, ${res.skipped} skipped, ${res.missingFollowerCounts} unranked.`,
      );
      await loadOverview();
    } catch (err: unknown) {
      setActionMessage(err instanceof Error ? err.message : 'Seed import failed.');
    } finally {
      setIsActionRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--brand-slate)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            System & Operations Overview
          </h1>
          <p className="text-xs text-[var(--neutral-400)] mt-1">
            Real-time status of monitored watchlist creators, ranking pipelines, and snapshot data
            sources.
          </p>
        </div>

        <button
          onClick={loadOverview}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--brand-slate)] hover:bg-[var(--brand-slate)]/80 text-[var(--neutral-200)] border border-[var(--neutral-700)]/60 transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[var(--brand-accent)]' : ''}`}
          />
          <span>Refresh Status</span>
        </button>
      </div>

      {!isLoading && !data && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs">
          Overview is unavailable. Sign in again if the session expired — no placeholder counts are
          shown.
        </div>
      )}

      {/* Operational Banner Notice */}
      {actionMessage && (
        <div className="p-4 rounded-xl bg-blue-950/70 border border-blue-700/60 text-blue-200 text-xs flex items-center justify-between gap-3 shadow-md">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage('')}
            className="text-blue-400 hover:text-blue-100 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metric Stat Cards (§12.10) — Distinct colored left borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monitored */}
        <div className="p-5 rounded-2xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] border-l-4 border-l-blue-500 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)]">
              Tracked Creators
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-white mb-1">
            {data?.totalProfiles ?? '...'}
          </div>
          <span className="text-[11px] text-[var(--neutral-400)]">
            {data?.listedProfiles ?? 0} listed · {data?.unlistedProfiles ?? 0} hidden
          </span>
        </div>

        {/* Ranked Personalities */}
        <div className="p-5 rounded-2xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] border-l-4 border-l-sky-500 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)]">
              Ranked Personalities
            </span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-sky-400 mb-1">
            {data?.rankedProfiles ?? '...'}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">
            Active with verified followers
          </span>
        </div>

        {/* Unranked Baseline */}
        <div className="p-5 rounded-2xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] border-l-4 border-l-amber-500 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)]">
              Unranked / Nulls
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-white mb-1">
            {data?.unrankedProfiles ?? '...'}
          </div>
          <span className="text-[11px] text-amber-400/90 font-medium">
            Pending verified observation
          </span>
        </div>

        {/* Pipeline Status */}
        <div className="p-5 rounded-2xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] border-l-4 border-l-[var(--status-up)] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)]">
              Pipeline Freshness
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-mono font-bold text-white mb-1">
            {data?.isStale ? 'Stale (>36h)' : 'Fresh & Active'}
          </div>
          <span className="text-[11px] text-[var(--neutral-400)]">
            Last run:{' '}
            {data?.hoursSinceLastRun != null
              ? `${data.hoursSinceLastRun}h ago`
              : 'baseline snapshot'}
          </span>
        </div>
      </div>

      {/* Quick Action Triggers (§12.10) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rebuild Rankings Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-display font-bold text-white">
                Recompute Rankings Engine
              </h2>
              <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
                Executes the{' '}
                <code className="px-1 py-0.5 rounded bg-[var(--brand-slate)] text-[var(--brand-accent)] font-mono text-[11px]">
                  followers_v1
                </code>{' '}
                algorithm across Global and India scopes, re-calculating competition ranks and
                deltas.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--brand-accent)]/15 text-[var(--brand-accent)] shrink-0 ml-4">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <button
            onClick={handleRebuild}
            disabled={isActionRunning}
            className="btn-primary w-full text-xs justify-center cursor-pointer disabled:opacity-50"
          >
            <span>Run Rankings Rebuild</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Import Seed Watchlist Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-display font-bold text-white">
                Re-import Seed Spreadsheet
              </h2>
              <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
                Reads the 400-row research workbook, normalizing handles and appending baseline
                metric snapshots without duplicating records.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 shrink-0 ml-4">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={isActionRunning}
            className="w-full py-3 px-4 rounded-xl bg-[var(--brand-slate)] hover:bg-[var(--brand-slate)]/80 border border-[var(--neutral-700)] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <span>Execute Seed Import</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
          </button>
        </div>
      </div>

      {/* Navigation Quick Links (§12.10) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] shadow-sm">
        <h3 className="text-sm font-display font-bold text-white mb-4">Workspace Direct Access</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Link
            href="/admin/watchlist"
            className="p-3.5 rounded-xl bg-[var(--brand-slate)]/60 hover:bg-[var(--brand-slate)] border border-[var(--neutral-700)]/40 text-[var(--neutral-300)] hover:text-white transition-all font-semibold"
          >
            Manage Watchlist →
          </Link>
          <Link
            href="/admin/import"
            className="p-3.5 rounded-xl bg-[var(--brand-slate)]/60 hover:bg-[var(--brand-slate)] border border-[var(--neutral-700)]/40 text-[var(--neutral-300)] hover:text-white transition-all font-semibold"
          >
            Import Reports →
          </Link>
          <Link
            href="/admin/sync"
            className="p-3.5 rounded-xl bg-[var(--brand-slate)]/60 hover:bg-[var(--brand-slate)] border border-[var(--neutral-700)]/40 text-[var(--neutral-300)] hover:text-white transition-all font-semibold"
          >
            Sync Pipeline →
          </Link>
          <Link
            href="/admin/audit"
            className="p-3.5 rounded-xl bg-[var(--brand-slate)]/60 hover:bg-[var(--brand-slate)] border border-[var(--neutral-700)]/40 text-[var(--neutral-300)] hover:text-white transition-all font-semibold"
          >
            Audit Logs →
          </Link>
        </div>
      </div>
    </div>
  );
}
