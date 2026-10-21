'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { portraitUrl } from '@/lib/media/portrait';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  rank?: number;
  className?: string;
  rounded?: 'square' | 'full';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  rounded = 'square',
}) => {
  const [failed, setFailed] = useState(false);

  const getInitials = (str: string) => {
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { px: 48, text: 'text-xs', box: 'w-12 h-12' };
      case 'md':
        return { px: 96, text: 'text-sm', box: 'w-[88px] h-[88px] sm:w-[96px] sm:h-[96px]' };
      case 'lg':
        return { px: 120, text: 'text-xl', box: 'w-[120px] h-[120px]' };
      case 'xl':
        return { px: 168, text: 'text-2xl', box: 'w-[168px] h-[168px]' };
      case 'hero':
        return { px: 280, text: 'text-4xl', box: 'w-[168px] h-[168px] sm:w-[220px] sm:h-[220px]' };
    }
  };

  const { px, text, box } = getDimensions();
  const imageSrc = portraitUrl(src);
  const showImage = Boolean(imageSrc) && !failed;
  const radius = rounded === 'full' ? 'rounded-full' : 'rounded-none';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden bg-[var(--canvas)] ${box} ${radius} ${className}`}
    >
      {showImage ? (
        <Image
          src={imageSrc as string}
          alt={name}
          width={px}
          height={px}
          className="object-cover object-top w-full h-full"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={`font-display text-[var(--ink-muted)] select-none ${text}`}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};
