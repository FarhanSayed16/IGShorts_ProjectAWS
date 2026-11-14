import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessBannerProps {
  message: string;
  onDismiss?: () => void;
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({ message, onDismiss }) => {
  return (
    <div
      role="status"
      className="border border-[#00d26a]/40 bg-[#00d26a]/10 p-4 text-[#00d26a] flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3 min-w-0">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium text-[var(--ink)] dark:text-white">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 p-1 text-[#00d26a] hover:text-[var(--ink)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
