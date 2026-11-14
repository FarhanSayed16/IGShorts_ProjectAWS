'use client';

import React from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';

interface SessionExpiredModalProps {
  open: boolean;
  loginHref?: string;
  loginLabel?: string;
  onClose?: () => void;
}

export function SessionExpiredModal({
  open,
  loginHref = '/account',
  loginLabel = 'Sign in again',
  onClose,
}: SessionExpiredModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-expired-title"
        className="max-w-sm w-full bg-black border border-white/20 p-6 space-y-4 text-white shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#00d26a]/40 bg-[#00d26a]/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#00d26a]" />
          </div>
          <h2 id="session-expired-title" className="text-sm font-bold uppercase tracking-[0.12em]">
            Session expired
          </h2>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          Your session has ended. Sign in again to continue where you left off.
        </p>
        <div className="flex items-center justify-end gap-2 pt-1">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          )}
          <Link
            href={loginHref}
            className="inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] bg-[#00d26a] text-black hover:bg-white transition-colors"
          >
            {loginLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
