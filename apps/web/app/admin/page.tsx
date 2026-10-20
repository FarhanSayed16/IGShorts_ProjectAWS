'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Trophy,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            System & Operations Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of monitored watchlist creators, ranking pipelines, and data sources.
          </p>
        </div>

        <button
          onClick={loadOverview}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {!isLoading && !data && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
          Overview is unavailable. Sign in again if the session expired — no placeholder counts are
          shown.
        </div>
      )}

      {/* Operational Banner Notice */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800 text-blue-200 text-xs flex items-center justify-between gap-2">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage('')}
            className="text-blue-400 hover:text-blue-200 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monitored */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tracked Creators
            </span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-white mb-1">
            {data?.totalProfiles ?? '...'}
          </div>
          <span className="text-[11px] text-slate-500">
            {data?.listedProfiles ?? 0} listed · {data?.unlistedProfiles ?? 0} hidden
          </span>
        </div>

        {/* Ranked Personalities */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Ranked Personalities
            </span>
            <Trophy className="w-4 h-4 text-gold" />
          </div>
          <div className="text-3xl font-mono font-bold text-white mb-1">
            {data?.rankedProfiles ?? '...'}
          </div>
          <span className="text-[11px] text-emerald-400">Active with verified followers</span>
        </div>

        {/* Unranked Baseline */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Unranked / Nulls
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-white mb-1">
            {data?.unrankedProfiles ?? '...'}
          </div>
          <span className="text-[11px] text-amber-400/80">Pending verified observation</span>
        </div>

        {/* Pipeline Status */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pipeline Freshness
            </span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-bold text-white mb-1">
            {data?.isStale ? 'Stale (>36h)' : 'Fresh & Active'}
          </div>
          <span className="text-[11px] text-slate-500">
            Last run:{' '}
            {data?.hoursSinceLastRun != null
              ? `${data.hoursSinceLastRun}h ago`
              : 'no successful run'}
          </span>
        </div>
      </div>

      {/* Quick Action Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rebuild Rankings Card */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recompute Rankings Engine</h2>
              <p className="text-xs text-slate-400 mt-1">
                Executes the <code>followers_v1</code> algorithm across Global and India scopes,
                re-calculating competition ranks and deltas.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-gold/10 text-gold">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <button
            onClick={handleRebuild}
            disabled={isActionRunning}
            className="w-full py-2.5 px-4 rounded-lg bg-navy hover:bg-navy-2 text-white text-xs font-semibold border border-navy-2 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <span>Run Rankings Rebuild</span>
            <ArrowRight className="w-3.5 h-3.5 text-gold" />
          </button>
        </div>

        {/* Import Seed Watchlist Card */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Re-import Seed Spreadsheet</h2>
              <p className="text-xs text-slate-400 mt-1">
                Reads the 400-row research workbook, normalizing handles and appending baseline
                metric snapshots.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-950 text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={isActionRunning}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <span>Execute Seed Import</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-4">Workspace Direct Access</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Link
            href="/admin/watchlist"
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            Manage Watchlist →
          </Link>
          <Link
            href="/admin/import"
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            Import Reports →
          </Link>
          <Link
            href="/admin/rankings"
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            Ranking Runs →
          </Link>
          <Link
            href="/admin/sync"
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            Provider Sync →
          </Link>
          <Link
            href="/admin/audit"
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            View Audit Trail →
          </Link>
        </div>
      </div>
    </div>
  );
}
