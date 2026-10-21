import type { Metadata } from 'next';
import { Hash } from 'lucide-react';
import { ComingSoonPage } from '@/components/feedback/coming-soon';

export const metadata: Metadata = {
  title: 'Trending Hashtags & Audio — Coming Soon',
  description: 'Upcoming hashtag velocity discovery tools on IGshorts.',
  robots: { index: false, follow: false },
};

export default function HashtagsStubPage() {
  return (
    <ComingSoonPage
      icon={Hash}
      title="Trending Hashtags & Audio Tracker"
      description="Monitor breakthrough audio trends, viral Reels hashtags, and category keyword momentum used by the world’s leading creators."
    />
  );
}
