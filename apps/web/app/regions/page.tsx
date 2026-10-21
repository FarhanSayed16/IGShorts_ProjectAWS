import type { Metadata } from 'next';
import { MapPin } from 'lucide-react';
import { ComingSoonPage } from '@/components/feedback/coming-soon';

export const metadata: Metadata = {
  title: 'Regional Leaderboards — Coming Soon',
  description: 'Sub-national and city-level creator rankings coming in Roadmap v2.',
  robots: { index: false, follow: false },
};

export default function RegionsStubPage() {
  return (
    <ComingSoonPage
      icon={MapPin}
      title="Regional & City Leaderboards"
      description="Sub-national rankings covering Indian regional languages (Telugu, Tamil, Malayalam, Punjabi, Marathi cinema) and global territories (Latin America, Europe, MENA)."
    />
  );
}
