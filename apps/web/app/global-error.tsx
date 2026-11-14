'use client';

import React from 'react';
import { Inter, Oswald } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#f5f5f5',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-display), Impact, sans-serif',
              fontSize: 64,
              fontWeight: 700,
              color: '#00d26a',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Error
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display), Impact, sans-serif',
              fontSize: 28,
              textTransform: 'uppercase',
              margin: '12px 0',
            }}
          >
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: '#a3a3a3', lineHeight: 1.5, marginBottom: 24 }}>
            The root layout crashed. You can retry this view or return home.
            {error?.digest ? (
              <>
                <br />
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
                  Digest: {error.digest}
                </span>
              </>
            ) : null}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                background: '#00d26a',
                color: '#0a0a0a',
                border: 'none',
                padding: '12px 20px',
                fontWeight: 700,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
            <a
              href="/"
              style={{
                border: '1px solid #404040',
                color: '#f5f5f5',
                padding: '12px 20px',
                fontWeight: 700,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                textDecoration: 'none',
              }}
            >
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
