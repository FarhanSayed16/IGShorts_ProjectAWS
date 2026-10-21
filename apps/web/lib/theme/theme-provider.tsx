'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => undefined,
});

const STORAGE_KEY = 'igshorts-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const next: Theme = stored === 'dark' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute('data-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
