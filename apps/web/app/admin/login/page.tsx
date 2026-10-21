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
    <div className="min-h-screen bg-[var(--brand-deep)] flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background radial sky glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[var(--brand-navy)] rounded-2xl p-8 sm:p-10 shadow-2xl border border-[var(--brand-slate)] relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-[0_0_20px_rgba(14,165,233,0.2)] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-sky-400" />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
            IG<span className="text-sky-400">shorts</span> Workspace
          </h1>
          <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
            Restricted operations portal for watchlist management and ranking pipeline triggers.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 mb-6 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-1.5"
            >
              Operator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--neutral-500)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-email"
                type="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[var(--brand-deep)] border border-[var(--brand-slate)] rounded-xl focus:outline-none focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] text-white font-mono placeholder:text-[var(--neutral-600)] transition-all"
                placeholder="operator@igshorts.internal"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-1.5"
            >
              Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--neutral-500)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[var(--brand-deep)] border border-[var(--brand-slate)] rounded-xl focus:outline-none focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] text-white font-mono placeholder:text-[var(--neutral-600)] transition-all"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(2,132,199,0.3)] disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--brand-slate)] text-center">
          <p className="text-[11px] text-[var(--neutral-500)]">
            Production tokens are encrypted and time-bound. Activity is audited.
          </p>
        </div>
      </div>
    </div>
  );
}
