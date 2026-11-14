'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SessionExpiredModal } from './session-expired-modal';

type SessionKind = 'admin' | 'member' | null;

interface SessionExpiredContextValue {
  notifyExpired: (kind?: 'admin' | 'member') => void;
}

const SessionExpiredContext = createContext<SessionExpiredContextValue>({
  notifyExpired: () => undefined,
});

export function useSessionExpired() {
  return useContext(SessionExpiredContext);
}

export function notifySessionExpired(kind: 'admin' | 'member' = 'admin') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('igshorts-session-expired', { detail: { kind } }));
}

export function SessionExpiredProvider({ children }: { children: React.ReactNode }) {
  const [kind, setKind] = useState<SessionKind>(null);

  useEffect(() => {
    const onExpire = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: 'admin' | 'member' }>).detail;
      setKind(detail?.kind === 'member' ? 'member' : 'admin');
    };
    window.addEventListener('igshorts-session-expired', onExpire);
    return () => window.removeEventListener('igshorts-session-expired', onExpire);
  }, []);

  const notifyExpired = useCallback((next: 'admin' | 'member' = 'admin') => {
    setKind(next);
  }, []);

  return (
    <SessionExpiredContext.Provider value={{ notifyExpired }}>
      {children}
      <SessionExpiredModal
        open={kind !== null}
        loginHref={kind === 'admin' ? '/admin/login' : '/account'}
        loginLabel={kind === 'admin' ? 'Operator sign in' : 'Sign in again'}
        onClose={() => setKind(null)}
      />
    </SessionExpiredContext.Provider>
  );
}
