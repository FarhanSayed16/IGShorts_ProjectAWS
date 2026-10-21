'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Trophy,
  History,
  ShieldCheck,
  LogOut,
  ExternalLink,
  ChevronRight,
  Activity,
  RefreshCw,
} from 'lucide-react';
import {
  getStoredAdminToken,
  getStoredAdminEmail,
  clearAdminSession,
} from '@/lib/api/admin-client';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Watchlist', href: '/admin/watchlist', icon: Users },
  { label: 'Import Seed', href: '/admin/import', icon: FileSpreadsheet },
  { label: 'Sync Pipeline', href: '/admin/sync', icon: RefreshCw },
  { label: 'Rankings Engine', href: '/admin/rankings', icon: Trophy },
  { label: 'Job Schedules', href: '/admin/jobs', icon: Activity },
  { label: 'Audit Trail', href: '/admin/audit', icon: History },
];

function environmentLabel() {
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  try {
    const host = new URL(api).host;
    if (host.includes('localhost') || host.startsWith('127.')) {
      return `Local · ${host}`;
    }
    return host;
  } catch {
    return api;
  }
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    if (pathname === '/admin/login') return;

    const token = getStoredAdminToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setAdminEmail(getStoredAdminEmail() || '');
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    clearAdminSession();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[var(--brand-deep)] text-[var(--neutral-100)] flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation (§12.10) */}
      <aside className="w-full md:w-64 bg-[var(--brand-deep)] border-r border-[var(--brand-slate)] flex flex-col shrink-0">
        <div className="p-5 border-b border-[var(--brand-slate)] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/40 text-sky-400 flex items-center justify-center font-bold shadow-[0_0_12px_rgba(14,165,233,0.25)]">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-bold text-base text-white tracking-tight">
                IG<span className="text-sky-400">shorts</span>
              </span>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--neutral-400)]">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[var(--brand-slate)] text-sky-400 border border-sky-400/30 border-l-4 border-l-sky-400 shadow-sm'
                    : 'text-[var(--neutral-400)] hover:text-white hover:bg-[var(--brand-slate)]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-[var(--neutral-400)]'}`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--brand-slate)] space-y-3">
          <div className="px-3.5 py-2.5 rounded-xl bg-[var(--brand-slate)]/60 border border-[var(--neutral-700)]/40 text-xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--neutral-400)]">
              Authenticated Operator
            </span>
            <span className="font-mono text-white truncate block text-[11px] mt-0.5 font-medium">
              {adminEmail || 'Signed in'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-[var(--neutral-400)] hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Dashboard</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070B14]">
        <header className="h-14 bg-[var(--brand-deep)] border-b border-[var(--brand-slate)] px-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[var(--status-up)] animate-pulse" />
            <span className="font-mono text-[var(--neutral-400)] text-[11px]">
              API: {environmentLabel()}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--status-up)]" />
            <span>Operator Mode Active</span>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
