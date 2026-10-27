'use client';

import { useCallback, useEffect, useState } from 'react';
import { memberFetch, readMemberToken, writeMemberToken } from '@/lib/member-session';

export function useMemberSession() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!readMemberToken()) {
      setEmail(null);
      setReady(true);
      return;
    }
    try {
      const me = (await memberFetch('/members/me')) as { user: { email: string } };
      setEmail(me.user.email);
    } catch {
      writeMemberToken(null);
      setEmail(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onChange = () => {
      void refresh();
    };
    window.addEventListener('igshorts-member', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('igshorts-member', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [refresh]);

  const signOut = useCallback(() => {
    writeMemberToken(null);
    setEmail(null);
  }, []);

  return { email, ready, signOut, refresh };
}
