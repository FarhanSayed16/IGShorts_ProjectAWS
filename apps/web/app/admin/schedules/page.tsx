'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  Loader2,
  Play,
  AlertTriangle,
  CheckCircle2,
  ShieldOff,
  Zap,
} from 'lucide-react';
import {
  getAdminSchedules,
  setAdminScheduleEnabled,
  triggerDailyPipeline,
  triggerDiscoveryRefresh,
  type ScheduleIntent,
} from '@/lib/api/admin-client';

const FALLBACK_INTENTS: ScheduleIntent[] = [
  {
    jobKey: 'daily_ranking_pipeline',
    label: 'Daily ranking pipeline',
    cronExpr: '0 2 * * *',
    intentTime: '02:00',
    description: 'Sync due profiles and rebuild Global & India leaderboards.',
    runEndpoint: 'pipeline',
    enabledByDefault: false,
  },
  {
    jobKey: 'discovery_refresh',
    label: 'Discovery refresh',
    cronExpr: '30 3 * * *',
    intentTime: '03:30',
    description: 'Refresh Trends / Music / Pulse editorial discovery jobs.',
    runEndpoint: 'discovery',
    enabledByDefault: false,
  },
];

type RunKind = 'pipeline' | 'discovery' | null;

export default function AdminSchedulesPage() {
  const [cronEnabled, setCronEnabled] = useState<boolean | null>(null);
  const [intents, setIntents] = useState<ScheduleIntent[]>(FALLBACK_INTENTS);
  const [note, setNote] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [running, setRunning] = useState<RunKind>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [runError, setRunError] = useState('');

  useEffect(() => {
    if (!running || !runStartedAt) {
      setElapsedSec(0);
      return;
    }
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - runStartedAt) / 1000));
    }, 500);
    return () => window.clearInterval(id);
  }, [running, runStartedAt]);

  const load = useCallback(async () => {
    setLoadError('');
    try {
      const data = await getAdminSchedules();
      setCronEnabled(data.cronEnabled);
      setIntents(data.intents?.length ? data.intents : FALLBACK_INTENTS);
      setNote(data.note ?? null);
    } catch (err) {
      setCronEnabled(null);
      setIntents(FALLBACK_INTENTS);
      setLoadError(err instanceof Error ? err.message : 'Could not load schedules');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runNow = async (kind: 'pipeline' | 'discovery') => {
    if (running) return;
    setRunning(kind);
    setRunStartedAt(Date.now());
    setRunError('');
    setReport(null);
    try {
      const res =
        kind === 'pipeline'
          ? ((await triggerDailyPipeline()) as Record<string, unknown>)
          : await triggerDiscoveryRefresh();
      setReport(res);
      await load();
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Run failed');
    } finally {
      setRunning(null);
      setRunStartedAt(null);
    }
  };

  const toggleEnabled = async (jobKey: string, enabled: boolean) => {
    setToggling(jobKey);
    try {
      await setAdminScheduleEnabled(jobKey, enabled);
      await load();
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Could not update schedule');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-6 border-b border-[var(--brand-slate)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00d26a] mb-2">
          Schedules
        </p>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
          Schedule Command Deck
        </h1>
        <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
          Ranking at 02:00 and discovery at 03:30. Job history lives under{' '}
          <Link href="/admin/jobs" className="text-[#00d26a] underline underline-offset-4">
            Job Schedules
          </Link>
          .
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--neutral-400)]">
            <Zap className="w-3.5 h-3.5 text-[#00d26a]" />
            CRON_ENABLED (env)
          </div>
          <p className="text-lg font-display font-bold text-white">
            {cronEnabled === null ? 'Unknown' : cronEnabled ? 'On' : 'Off'}
          </p>
          <p className="text-xs text-[var(--neutral-400)] leading-relaxed">
            Platform cron / Render triggers. Independent of operator schedule toggles.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--neutral-400)]">
            <ShieldOff className="w-3.5 h-3.5 text-white" />
            Operator schedules
          </div>
          <p className="text-lg font-display font-bold text-white">Default off</p>
          <p className="text-xs text-[var(--neutral-400)] leading-relaxed">
            Stored <code className="text-[var(--neutral-300)]">SystemSchedule.enabled</code> rows
            stay disabled until an operator turns them on. Env cron does not flip these.
          </p>
        </div>
      </div>

      {note && (
        <p className="text-xs text-[var(--neutral-400)] border border-dashed border-white/15 rounded-xl px-4 py-3">
          {note}
        </p>
      )}

      {loadError && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Schedule API unavailable ({loadError}). Showing static intents. Run Now still uses job
            endpoints.
          </span>
        </div>
      )}

      {runError && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{runError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {intents.map((intent) => {
          const kind = intent.runEndpoint;
          const isThisRunning = running === kind;
          const locked = running !== null;
          return (
            <div
              key={intent.jobKey}
              className="p-6 sm:p-8 rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] shadow-lg space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00d26a]">
                    Intent {intent.intentTime}
                  </p>
                  <h2 className="text-base font-display font-bold text-white mt-1">{intent.label}</h2>
                  <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
                    {intent.description}
                  </p>
                  <p className="mt-3 font-mono text-[11px] text-[var(--neutral-300)]">
                    cron: {intent.cronExpr || '—'} · key: {intent.jobKey}
                  </p>
                  <p className="mt-2 text-[11px] text-[var(--neutral-400)]">
                    Last run: {intent.lastRunAt ? new Date(intent.lastRunAt).toLocaleString() : '—'}
                    {intent.lastStatus ? ` · ${intent.lastStatus}` : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono uppercase">
                    {intent.disabledByEnv && (
                      <span className="px-2 py-0.5 border border-amber-700 text-amber-300">
                        Disabled by env
                      </span>
                    )}
                    {intent.disabledByOperator !== false && (
                      <span className="px-2 py-0.5 border border-white/20 text-[var(--neutral-300)]">
                        Disabled by operator
                      </span>
                    )}
                    {intent.enabled && (
                      <span className="px-2 py-0.5 border border-[#00d26a]/50 text-[#00d26a]">
                        Operator enabled
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#00d26a] shrink-0">
                  <CalendarClock className="w-5 h-5" />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void toggleEnabled(intent.jobKey, !intent.enabled)}
                  disabled={toggling === intent.jobKey}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {toggling === intent.jobKey
                    ? 'Saving…'
                    : intent.enabled
                      ? 'Disable'
                      : 'Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => void runNow(kind)}
                  disabled={locked}
                  className="flex-[1.4] py-2.5 px-3 rounded-xl bg-[#00d26a] hover:bg-white text-black text-[11px] font-display font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2 justify-center">
                    {isThisRunning ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    {isThisRunning ? `Running… ${elapsedSec}s` : 'Run Now'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {report && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] shadow-lg space-y-4">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-display font-bold text-white">Last Run Report</h2>
          </div>
          <pre className="text-xs font-mono text-emerald-300 bg-[var(--brand-deep)] border border-[var(--brand-slate)] rounded-xl p-4 overflow-x-auto leading-relaxed">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
