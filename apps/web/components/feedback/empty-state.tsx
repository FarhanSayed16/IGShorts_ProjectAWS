import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No accounts found',
  description = 'Try adjusting your search query or filter criteria.',
  actionText = 'View All Rankings',
  actionHref = '/charts/global',
}) => {
  return (
    <div className="py-16 px-6 text-center rounded-2xl border border-dashed border-[var(--neutral-300)] dark:border-[var(--neutral-700)] bg-[var(--neutral-0)]">
      <div className="w-12 h-12 rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] text-[var(--neutral-400)] flex items-center justify-center mx-auto mb-4">
        <Search className="w-6 h-6" />
      </div>
      <h3 className="font-display text-lg font-bold text-[var(--neutral-900)] dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--neutral-500)] dark:text-[var(--neutral-400)] max-w-sm mx-auto mb-6">
        {description}
      </p>
      {actionHref && (
        <Link href={actionHref} className="btn-primary text-xs">
          {actionText}
        </Link>
      )}
    </div>
  );
};
