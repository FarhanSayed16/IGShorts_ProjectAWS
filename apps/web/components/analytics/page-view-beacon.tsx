'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/beacon';

export function PageViewBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    trackEvent('page_view', { path: pathname });
  }, [pathname]);

  return null;
}
