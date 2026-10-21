import React from 'react';

interface RankNumberProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  featured?: boolean;
}

export const RankNumber: React.FC<RankNumberProps> = ({ rank, size = 'md', featured }) => {
  const isLead = Boolean(featured) || size === 'hero';

  const sizeClass =
    size === 'hero'
      ? 'text-5xl sm:text-7xl'
      : size === 'lg'
        ? 'text-4xl'
        : size === 'sm'
          ? 'text-lg'
          : 'text-2xl sm:text-3xl';

  if (isLead && size !== 'sm') {
    return (
      <span
        className={`inline-flex items-center justify-center min-w-[52px] h-[72px] sm:min-w-[64px] sm:h-[88px] bg-[var(--accent)] text-[var(--accent-ink)] font-display ${size === 'hero' ? 'text-6xl sm:text-7xl min-w-[72px] sm:min-w-[88px] h-[168px] sm:h-[220px]' : 'text-4xl'} tabular-nums`}
      >
        {rank}
      </span>
    );
  }

  return (
    <span className={`font-display tabular-nums tracking-tight text-[var(--ink)] ${sizeClass}`}>
      {rank}
    </span>
  );
};
