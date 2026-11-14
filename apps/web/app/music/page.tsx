import React from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { MusicPageClient } from './music-page-client';
import copy from '@/messages/en.json';

export const metadata: Metadata = {
  title: `${copy.brand.name} · Music`,
  description:
    'Discover editorial music selections with Spotify and YouTube listen links. IGshorts does not stream audio in-app.',
  openGraph: {
    title: `${copy.brand.name} · Music`,
    description: 'Editorial music discovery with outbound Spotify and YouTube links.',
  },
};

export default function MusicPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />
      <MusicPageClient />
      <PublicFooter />
    </div>
  );
}
