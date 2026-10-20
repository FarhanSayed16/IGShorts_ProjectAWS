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
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
          Watchlist Seed Import
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ingest initial Excel workbook seed accounts, parse follower metrics, deduplicate
          overlapping personas, and append baseline snapshots.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Import Action Card */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Source File
            </span>
            <p className="font-mono text-xs text-slate-200 mt-1">
              docs/IGshorts_Instagram_Account_Research_and_Architecture.xlsx
            </p>
            <p className="text-xs text-slate-500 mt-1">
              200 India rows + 200 Global rows (400 raw rows total). Normalizes @handles, merges 68
              overlapping personas, and isolates corporate brands.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-950 text-blue-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        <label className="block border border-dashed border-slate-700 rounded-xl p-6 text-center text-xs text-slate-400 cursor-pointer hover:border-[var(--color-gold)]">
          Drop an .xlsx here or click to upload
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
          className="py-2.5 px-5 rounded-lg bg-navy hover:bg-navy-2 text-white text-xs font-semibold border border-navy-2 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-4 h-4 text-gold" />
          <span>{isRunning ? 'Processing workbook...' : 'Import default seed file'}</span>
        </button>
      </div>

      {/* Execution Report View */}
      {report && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Import Execution Report</h2>
            </div>
            <span className="font-mono text-xs text-slate-400">
              Completed in {report.durationMs}ms
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-slate-500 uppercase text-[10px] font-bold">
                Profiles Created
              </span>
              <span className="text-2xl font-mono font-bold text-emerald-400">
                {report.createdProfiles ?? report.created ?? 0}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-slate-500 uppercase text-[10px] font-bold">
                Merged Across Scopes
              </span>
              <span className="text-2xl font-mono font-bold text-blue-400">
                {report.mergedProfiles ?? report.merged ?? 0}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-slate-500 uppercase text-[10px] font-bold">
                Unranked (Blank Follower)
              </span>
              <span className="text-2xl font-mono font-bold text-amber-400">
                {report.missingFollowerCounts ?? report.missingFollowers ?? 0}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-slate-500 uppercase text-[10px] font-bold">
                Skipped / Invalid
              </span>
              <span className="text-2xl font-mono font-bold text-rose-300">
                {report.skipped ?? 0}
              </span>
            </div>
          </div>

          {Array.isArray(report.badUsernames) && report.badUsernames.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900 text-xs text-rose-200">
              <div className="font-bold mb-1">Skipped handles</div>
              <p className="font-mono">{report.badUsernames.join(', ')}</p>
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="font-bold text-slate-300">Seed Validation Summary:</div>
            <div>
              • Fixed spaces in handles (e.g. <code>@m cstan</code> → <code>mcstan</code>)
            </div>
            <div>• Merged dual-scope figures (e.g. Virat Kohli on both India & Global charts)</div>
            <div>
              • Preserved missing follower counts as honest <code>NULL</code> (never coerced to 0)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
