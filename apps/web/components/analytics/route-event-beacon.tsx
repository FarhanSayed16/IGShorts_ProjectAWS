'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/beacon';

/** Emits chart_view / profile_view for matching public routes. */
export function RouteEventBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    if (pathname.startsWith('/charts')) {
      trackEvent('chart_view', { path: pathname });
      return;
    }
    if (pathname.startsWith('/profiles/')) {
      trackEvent('profile_view', { path: pathname });
    }
  }, [pathname]);

  return null;
}
