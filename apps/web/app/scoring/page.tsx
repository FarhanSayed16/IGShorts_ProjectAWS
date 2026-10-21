import type { Metadata } from 'next';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { ComingSoonPage } from '@/components/feedback/coming-soon';

export const metadata: Metadata = {
  title: 'Scoring Engine v2 — Coming Soon',
  description:
    'Roadmap preview of the multi-factor weighted scoring engine for Instagram creators.',
  robots: { index: false, follow: false },
};

export default function ScoringStubPage() {
  return (
    <ComingSoonPage
      icon={Sparkles}
      title="Weighted Creator Scoring Engine"
      description="While v1 intentionally ranks creators strictly by public follower count for radical transparency, Scoring v2 will introduce an optional composite index blending follower velocity, verified identity tier, and sustained growth momentum."
    >
      <div className="p-6 bg-[var(--surface)] border border-[var(--line)] text-left max-w-lg mb-8 space-y-3 text-xs text-[var(--ink-muted)]">
        <div className="font-bold text-ink text-sm">Planned Scoring Parameters:</div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-up shrink-0" />
          <span>Public follower count baseline (60% weight)</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-up shrink-0" />
          <span>30-day follower velocity and acceleration (25% weight)</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-up shrink-0" />
          <span>Verified identity and public handle authority (15% weight)</span>
        </div>
      </div>
    </ComingSoonPage>
  );
}
