import type { ReactNode } from 'react';
import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import copy from '@/messages/en.json';

export function ComingSoonPage({
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />
      <main
        id="main-content"
        className="flex-1 max-w-[720px] mx-auto w-full px-4 sm:px-6 py-16"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] mb-4">
          {copy.comingSoon.badge}
        </p>
        <h1 className="chart-title text-5xl sm:text-6xl mb-4">{title}</h1>
        <p className="text-sm sm:text-base text-[var(--ink-muted)] max-w-xl leading-relaxed mb-8">
          {description}
        </p>
        {children}
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-[0.16em] underline underline-offset-4"
        >
          {copy.comingSoon.back}
        </Link>
      </main>
      <PublicFooter />
    </div>
  );
}
