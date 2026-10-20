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
  { label: 'Sync', href: '/admin/sync', icon: RefreshCw },
  { label: 'Rankings', href: '/admin/rankings', icon: Trophy },
  { label: 'Job Pipelines', href: '/admin/jobs', icon: Activity },
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)] text-[var(--color-navy)] flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-base text-white tracking-tight">
                IG<span className="text-[var(--color-gold)]">shorts</span>
              </span>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[var(--color-navy)] text-white border border-[var(--color-navy-2)] shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-[var(--color-gold)]' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[var(--color-gold)]" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Authenticated Operator
            </span>
            <span className="font-mono text-slate-300 truncate block text-[11px] mt-0.5">
              {adminEmail || 'Signed in'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
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

      <div className="flex-1 flex flex-col min-w-0 bg-canvas">
        <header className="h-14 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-slate-400">API: {environmentLabel()}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin session</span>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
