import React from 'react';
import { formatExactNumber, formatFollowers } from '@/lib/format/formatters';

interface FollowerCountProps {
  count: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FollowerCount: React.FC<FollowerCountProps> = ({
  count,
  size = 'md',
  className = '',
}) => {
  const compact = formatFollowers(count);
  const exact = formatExactNumber(count);

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'md':
        return 'text-sm';
      case 'lg':
        return 'text-xl sm:text-2xl';
    }
  };

  return (
    <span
      className={`tabular-nums tracking-tight ${getSizeClass()} ${className}`}
      title={`${exact} followers`}
    >
      {compact}
    </span>
  );
};
