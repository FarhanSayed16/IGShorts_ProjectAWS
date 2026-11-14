'use client';

import React, { useState } from 'react';
import { TREND_CATEGORY_LABELS, TrendCategory } from '@igshorts/shared';

const CATEGORY_TONE: Record<TrendCategory, { from: string; to: string; label: string }> = {
  music: { from: '#111111', to: '#00d26a', label: 'Music' },
  news: { from: '#1a1a1a', to: '#3a3a3a', label: 'News' },
  internet_culture: { from: '#111111', to: '#5c5c5c', label: 'Internet Culture' },
  entertainment: { from: '#111111', to: '#2d2d2d', label: 'Entertainment' },
  technology: { from: '#0b1f14', to: '#00a857', label: 'Technology' },
  sports_gaming: { from: '#111111', to: '#1f4d33', label: 'Sports & Gaming' },
};

export function DiscoveryMedia({
  imageUrl,
  category,
  alt = '',
  className = '',
  label,
}: {
  imageUrl?: string | null;
  category?: TrendCategory | string | null;
  alt?: string;
  className?: string;
  label?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (imageUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={alt}
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  const tone =
    category && category in CATEGORY_TONE
      ? CATEGORY_TONE[category as TrendCategory]
      : { from: '#111111', to: '#2a2a2a', label: label || 'IGshorts' };
  const text =
    label ||
    (category && category in TREND_CATEGORY_LABELS
      ? TREND_CATEGORY_LABELS[category as TrendCategory]
      : tone.label);

  return (
    <div
      className={`relative w-full h-full min-h-[inherit] overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${tone.from} 0%, ${tone.to} 100%)`,
      }}
      aria-hidden={alt ? undefined : true}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 45%), radial-gradient(circle at 80% 70%, rgba(0,210,106,0.35), transparent 40%)',
        }}
      />
      <div className="absolute inset-0 flex items-end p-4 sm:p-5">
        <span className="text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em]">
          {text}
        </span>
      </div>
    </div>
  );
}

export const CATEGORY_BLURBS: Record<TrendCategory, string> = {
  music: 'Songs and audio gaining public attention',
  news: 'Policy, platforms, and public reporting',
  internet_culture: 'Memes, formats, and viral moments',
  entertainment: 'Film, OTT, and celebrity conversation',
  technology: 'Creator tools and product launches',
  sports_gaming: 'Match chatter and gaming moments',
};
