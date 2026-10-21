import type { Metadata } from 'next';
import { Newspaper } from 'lucide-react';
import { ComingSoonPage } from '@/components/feedback/coming-soon';

export const metadata: Metadata = {
  title: 'Creator News & Editorial — Coming Soon',
  description: 'Editorial commentary and milestone tracking for public figures on Instagram.',
  robots: { index: false, follow: false },
};

export default function NewsStubPage() {
  return (
    <ComingSoonPage
      icon={Newspaper}
      title="Creator News & Editorial Insights"
      description="Weekly analysis of milestone crossings (e.g. 100M+ followers), creator spotlight profiles, and industry trends across Global and Indian creators."
    />
  );
}
