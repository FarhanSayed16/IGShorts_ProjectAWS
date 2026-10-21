'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Users,
} from 'lucide-react';
import { triggerSeedImport, uploadSeedImport } from '@/lib/api/admin-client';

export default function AdminImportPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRunImport = async (file?: File) => {
    setIsRunning(true);
    setErrorMsg('');
    try {
      const res = file ? await uploadSeedImport(file) : await triggerSeedImport();
      setReport(res);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-6 border-b border-[var(--brand-slate)]">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
          Watchlist Seed Import
        </h1>
        <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
          Ingest initial Excel workbook seed accounts, parse follower metrics, deduplicate
          overlapping personas, and append baseline snapshots.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Import Action Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] shadow-lg space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--neutral-400)]">
              Active Source File
            </span>
            <p className="font-mono text-xs sm:text-sm text-[var(--brand-accent)] font-semibold mt-1">
              docs/IGshorts_Instagram_Account_Research_and_Architecture.xlsx
            </p>
            <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
              200 India rows + 200 Global rows (400 raw rows total). Normalizes @handles, merges 68
              overlapping personas, and isolates corporate brands.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <label className="block border-2 border-dashed border-[var(--brand-slate)] hover:border-[var(--brand-accent)] rounded-2xl p-8 text-center text-xs text-[var(--neutral-400)] cursor-pointer bg-[var(--brand-deep)]/60 transition-all">
          <span className="block font-semibold text-white mb-1">
            Drop a new .xlsx workbook here or browse
          </span>
          <span className="text-[11px] text-[var(--neutral-500)]">
            Supports .xlsx and .xls formats
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleRunImport(file);
            }}
          />
        </label>

        <button
          onClick={() => handleRunImport()}
          disabled={isRunning}
          className="py-3 px-6 rounded-xl bg-[var(--brand-accent)] hover:opacity-95 text-[var(--brand-deep)] text-xs font-display font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_4px_16px_rgba(212,168,67,0.2)] disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isRunning ? 'Processing Workbook...' : 'Import Default Seed Workbook'}</span>
        </button>
      </div>

      {/* Execution Report View */}
      {report && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--brand-slate)]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-display font-bold text-white">
                Import Execution Report
              </h2>
            </div>
            <span className="font-mono text-xs text-[var(--neutral-400)]">
              Duration: {report.durationMs}ms
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)]">
              <span className="block text-[var(--neutral-400)] uppercase text-[10px] font-bold tracking-wider">
                Profiles Created
              </span>
              <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">
                {report.createdProfiles ?? report.created ?? 0}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)]">
              <span className="block text-[var(--neutral-400)] uppercase text-[10px] font-bold tracking-wider">
                Merged Across Scopes
              </span>
              <span className="text-2xl font-mono font-bold text-blue-400 mt-1 block">
                {report.mergedProfiles ?? report.merged ?? 0}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)]">
              <span className="block text-[var(--neutral-400)] uppercase text-[10px] font-bold tracking-wider">
                Unranked (Honest Null)
              </span>
              <span className="text-2xl font-mono font-bold text-amber-400 mt-1 block">
                {report.missingFollowerCounts ?? report.missingFollowers ?? 0}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)]">
              <span className="block text-[var(--neutral-400)] uppercase text-[10px] font-bold tracking-wider">
                Skipped / Invalid
              </span>
              <span className="text-2xl font-mono font-bold text-rose-300 mt-1 block">
                {report.skipped ?? 0}
              </span>
            </div>
          </div>

          {Array.isArray(report.badUsernames) && report.badUsernames.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900 text-xs text-rose-200">
              <div className="font-bold mb-1">Skipped handles:</div>
              <p className="font-mono">{report.badUsernames.join(', ')}</p>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-xs text-[var(--neutral-400)] space-y-1.5">
            <div className="font-bold text-white">Seed Validation Integrity Guarantee:</div>
            <div>
              • Normalized whitespace in handles (e.g. <code>@m cstan</code> → <code>mcstan</code>)
            </div>
            <div>
              • De-duplicated shared identities (e.g. Virat Kohli tracked across India & Global
              leaderboards)
            </div>
            <div>
              • Missing follower counts strictly persisted as <code>NULL</code> (never coerced to 0)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
