'use client';

import React from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="pb-6 border-b border-[var(--brand-slate)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00d26a] mb-2">
          Settings
        </p>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
          Operator settings
        </h1>
        <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
          Read-only environment summary. MFA / token revoke land when hardening ships.
        </p>
      </div>

      <div className="p-6 rounded-2xl border border-[var(--brand-slate)] bg-[var(--brand-navy)] space-y-4">
        <div className="flex items-center gap-2 text-[#00d26a]">
          <Settings className="w-4 h-4" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Environment</h2>
        </div>
        <dl className="space-y-3 text-xs font-mono">
          <div>
            <dt className="text-[var(--neutral-500)]">Site</dt>
            <dd className="text-white break-all">{site}</dd>
          </div>
          <div>
            <dt className="text-[var(--neutral-500)]">API</dt>
            <dd className="text-white break-all">{api}</dd>
          </div>
          <div>
            <dt className="text-[var(--neutral-500)]">Maintenance</dt>
            <dd className="text-white">
              Set <code className="text-[#00d26a]">MAINTENANCE_MODE=true</code> on the web host to
              redirect public traffic to <Link href="/maintenance" className="underline">/maintenance</Link>.
            </dd>
          </div>
          <div>
            <dt className="text-[var(--neutral-500)]">Cron</dt>
            <dd className="text-white">
              Controlled by API <code className="text-[#00d26a]">CRON_ENABLED</code> — see{' '}
              <Link href="/admin/schedules" className="underline text-[#00d26a]">
                Schedules
              </Link>
              .
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
