import React from 'react';

/** Simple Billboard-style loading skeleton (black/white/#00d26a). */
export function BillboardSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-10 space-y-6 animate-pulse">
        <div className="h-3 w-28 bg-[#00d26a]/30" />
        <div className="h-12 w-64 sm:w-80 bg-black/10 dark:bg-white/10" />
        <div className="h-px w-full bg-[var(--line)]" />
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-3 border-b border-[var(--line)]"
            >
              <div className="h-4 w-8 bg-black/10 dark:bg-white/10" />
              <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 bg-black/10 dark:bg-white/10" />
                <div className="h-2 w-24 bg-black/5 dark:bg-white/5" />
              </div>
              <div className="h-3 w-16 bg-[#00d26a]/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
