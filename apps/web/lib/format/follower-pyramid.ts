export interface PyramidTier {
  id: string;
  level: number;
  name: string;
  shortName: string;
  minFollowers: number;
  maxFollowers: number | null;
  rangeLabel: string;
  refreshDays: number;
  refreshSchedule: string;
  color: string;
  bgWash: string;
  percentage: number;
  trackedCount: number;
  avgEngagement: string;
  algorithmReach: string;
  description: string;
  sampleCreators: {
    name: string;
    username: string;
    followers: string;
    avatarUrl?: string;
  }[];
}

export const PYRAMID_TIERS: PyramidTier[] = [
  {
    id: 'apex',
    level: 1,
    name: 'Apex Titans',
    shortName: 'Apex',
    minFollowers: 10_000_000,
    maxFollowers: null,
    rangeLabel: '10 Million and Above',
    refreshDays: 2,
    refreshSchedule: 'Every 2–3 Days',
    color: 'var(--accent)',
    bgWash: 'var(--accent-soft)',
    percentage: 0.15,
    trackedCount: 18,
    avgEngagement: '1.8% – 3.2%',
    algorithmReach: 'Global Explore Hegemony (100M+ weekly impressions)',
    description:
      'The rarest cultural icons on earth. Extremely high follower volatility; our engine re-crawls these profiles every 2–3 days to preserve real-time leaderboards.',
    sampleCreators: [
      {
        name: 'Cristiano Ronaldo',
        username: 'cristiano',
        followers: '679.8M',
        avatarUrl:
          'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg',
      },
      {
        name: 'Lionel Messi',
        username: 'leomessi',
        followers: '517.7M',
        avatarUrl:
          'https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg',
      },
      {
        name: 'Selena Gomez',
        username: 'selenagomez',
        followers: '423.5M',
        avatarUrl:
          'https://upload.wikimedia.org/wikipedia/commons/8/85/Selena_Gomez_-_Universal_Music_2023.jpg',
      },
    ],
  },
  {
    id: 'mega',
    level: 2,
    name: 'Mega Stars',
    shortName: 'Mega',
    minFollowers: 1_000_000,
    maxFollowers: 10_000_000,
    rangeLabel: '1 Million to 10 Million',
    refreshDays: 5,
    refreshSchedule: 'Every 5 Days',
    color: '#10b981',
    bgWash: 'rgba(16, 185, 129, 0.08)',
    percentage: 3.47,
    trackedCount: 420,
    avgEngagement: '2.5% – 4.8%',
    algorithmReach: 'Multi-territory recommendation syndication',
    description:
      'National and international creators with major cultural leverage. Refreshed on a steady 5-day cycle to capture viral shifts.',
    sampleCreators: [
      { name: 'Karan Aujla', username: 'karanaujla', followers: '8.4M' },
      { name: 'Zack King', username: 'zachking', followers: '9.2M' },
    ],
  },
  {
    id: 'established',
    level: 3,
    name: 'Established Macro',
    shortName: 'Established',
    minFollowers: 100_000,
    maxFollowers: 1_000_000,
    rangeLabel: '100 Thousand to 1 Million',
    refreshDays: 7,
    refreshSchedule: 'Every 7–8 Days',
    color: '#059669',
    bgWash: 'rgba(5, 150, 105, 0.06)',
    percentage: 23.46,
    trackedCount: 2840,
    avgEngagement: '3.8% – 6.5%',
    algorithmReach: 'High category authority & brand partnership pipeline',
    description:
      'Full-time professional digital creators, educators, and verified artists. Refreshed weekly (every 7–8 days) with 15% hysteresis dampening.',
    sampleCreators: [
      { name: 'Studio Binder', username: 'studiobinder', followers: '480K' },
      { name: 'Design Milk', username: 'designmilk', followers: '920K' },
    ],
  },
  {
    id: 'community',
    level: 4,
    name: 'Community Talent',
    shortName: 'Community',
    minFollowers: 10_000,
    maxFollowers: 100_000,
    rangeLabel: '10 Thousand to 100 Thousand',
    refreshDays: 10,
    refreshSchedule: 'Every 10–14 Days',
    color: '#047857',
    bgWash: 'rgba(4, 120, 87, 0.05)',
    percentage: 42.29,
    trackedCount: 5120,
    avgEngagement: '5.2% – 8.9%',
    algorithmReach: 'High-density niche audience distribution',
    description:
      'Rising creators with strong engaged followings. Starting tier for monetized creator programs and verified category rankings.',
    sampleCreators: [
      { name: 'Tokyo Street Beats', username: 'tokyobeats', followers: '45K' },
      { name: 'Analog Film Club', username: 'analogfilmclub', followers: '78K' },
    ],
  },
  {
    id: 'micro',
    level: 5,
    name: 'Micro Emerging',
    shortName: 'Micro',
    minFollowers: 1_000,
    maxFollowers: 10_000,
    rangeLabel: '1 Thousand to 10 Thousand',
    refreshDays: 21,
    refreshSchedule: 'Every 21 Days',
    color: '#065f46',
    bgWash: 'rgba(6, 95, 70, 0.04)',
    percentage: 21.81,
    trackedCount: 2640,
    avgEngagement: '7.5% – 12.4%',
    algorithmReach: 'Hyper-local & core peer network sharing',
    description:
      'Emerging talent with genuine peer-to-peer engagement. Monitored on a 3-week cadence to detect rapid breakouts into Community status.',
    sampleCreators: [
      { name: 'Indie Sound Lab', username: 'indiesoundlab', followers: '6.2K' },
    ],
  },
  {
    id: 'seed',
    level: 6,
    name: 'Seed Circle',
    shortName: 'Seed',
    minFollowers: 100,
    maxFollowers: 1_000,
    rangeLabel: '100 to 1 Thousand Followers',
    refreshDays: 30,
    refreshSchedule: 'Monthly Refresh',
    color: '#064e3b',
    bgWash: 'rgba(6, 78, 59, 0.03)',
    percentage: 8.83,
    trackedCount: 1069,
    avgEngagement: '10.0% – 18.0%',
    algorithmReach: 'Direct organic circles & close circle reels',
    description:
      'The foundational base of the pyramid. Tracked public creator accounts at the entry stage, audited once per month.',
    sampleCreators: [
      { name: 'Seed Creator Base', username: 'seedcreator', followers: '450' },
    ],
  },
];

export function getTierForFollowers(followers: number): PyramidTier {
  for (const tier of PYRAMID_TIERS) {
    if (tier.maxFollowers === null) {
      if (followers >= tier.minFollowers) return tier;
    } else {
      if (followers >= tier.minFollowers && followers < tier.maxFollowers) {
        return tier;
      }
    }
  }
  // If under 100, return seed
  return PYRAMID_TIERS[PYRAMID_TIERS.length - 1];
}

export function formatFollowerCount(count: number): string {
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toLocaleString();
}
