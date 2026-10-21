'use client';

import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, Clock, CheckCircle2 } from 'lucide-react';
import { getAdminJobRuns } from '@/lib/api/admin-client';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminJobRuns();
      setJobs(res);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--brand-slate)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Background Job Pipelines
          </h1>
          <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
            System cron executions, snapshot appends, and automated pipeline status.
          </p>
        </div>

        <button
          onClick={loadJobs}
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
                  Job Name
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Status
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Started At
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Finished At
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-slate)]/50">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-[var(--brand-slate)]/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{job.jobName}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm">
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[var(--neutral-400)] text-[11px]">
                    {new Date(job.startedAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[var(--neutral-400)] text-[11px]">
                    {job.finishedAt ? new Date(job.finishedAt).toLocaleString() : 'Running'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-white">
                    {job.stats || 'Success'}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--neutral-500)]">
                    No background job executions recorded yet.
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
