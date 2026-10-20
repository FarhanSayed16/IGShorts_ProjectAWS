'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { adminLogin } from '@/lib/api/admin-client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      await adminLogin(email, password);
      router.push('/admin');
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to authenticate. Please check your credentials.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-navy)] flex flex-col justify-center items-center px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/40 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-[var(--color-gold)]" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
            IGshorts Admin Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Restricted operations portal for watchlist management and ranking triggers.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 mb-6 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1"
            >
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-email"
                type="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)] focus:border-transparent text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)] focus:border-transparent text-slate-900 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-[var(--color-navy)] hover:bg-[var(--color-navy-2)] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4 text-[var(--color-gold)]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Internal administrative access only. All actions are logged to the audit trail.
          </p>
        </div>
      </div>
    </div>
  );
}
