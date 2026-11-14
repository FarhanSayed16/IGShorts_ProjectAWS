import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claim profile',
  description: 'Request review for a watchlist Instagram handle on IGshorts.',
  robots: { index: false, follow: false },
};

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
