import { MusicTrackCard, TrendCard } from '@igshorts/shared';

export interface DiscoveryAdapter {
  readonly code: string;
  readonly enabled: boolean;
  fetchTrends?(): Promise<Partial<TrendCard>[]>;
  fetchMusic?(): Promise<Partial<MusicTrackCard>[]>;
}
