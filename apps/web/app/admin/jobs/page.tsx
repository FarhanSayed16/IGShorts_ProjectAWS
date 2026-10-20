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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            Background Job Pipelines
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System cron executions, snapshot appends, and automated pipeline status.
          </p>
        </div>

        <button
          onClick={loadJobs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">Job Name</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Started At</th>
                <th className="py-3 px-4 font-semibold">Finished At</th>
                <th className="py-3 px-4 font-semibold text-right">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">{job.jobName}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {new Date(job.startedAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {job.finishedAt ? new Date(job.finishedAt).toLocaleString() : 'Running'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {job.stats || 'Success'}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
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
