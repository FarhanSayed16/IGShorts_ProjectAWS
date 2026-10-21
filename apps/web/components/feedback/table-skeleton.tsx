import React from 'react';

interface TableSkeletonProps {
  rows?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 10 }) => {
  return (
    <div className="w-full rounded-2xl border border-[var(--neutral-200)] dark:border-[var(--neutral-700)] bg-[var(--neutral-0)] p-5 space-y-4 shadow-sm animate-pulse">
      <div className="h-10 bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] rounded-xl w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-3 border-b border-[var(--neutral-200)]/40 dark:border-[var(--neutral-800)] last:border-0"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-36 bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] rounded-md" />
              <div className="h-3 w-20 bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] rounded-md" />
            </div>
          </div>
          <div className="h-4 w-20 bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] rounded-md" />
        </div>
      ))}
    </div>
  );
};
