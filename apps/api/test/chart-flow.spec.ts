/**
 * Smoke flow: unknown chart 400, hidden history 404, hide → rebuild omits the row.
 * Runs with mocked Prisma so CI does not need a live database.
 */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CHART_KEYS } from '@igshorts/shared';
import { ChartsService } from '../src/charts/charts.service.js';
import { RankingService } from '../src/ranking/ranking.service.js';

describe('import → rank → hide → rebuild smoke', () => {
  it('rejects a chart key that is not on the v1 allow-list', async () => {
    const charts = new ChartsService({} as never);
    await expect(charts.getChartMeta('global')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('public history 404s after a profile is hidden', async () => {
    const charts = new ChartsService({
      creatorProfile: {
        findUnique: jest.fn().mockResolvedValue({
          igUsername: 'danishzehen',
          isListed: false,
          isActive: true,
          metricSnapshots: [{ observedAt: new Date(), metricValue: 1_000_000n }],
          rankingEntries: [],
        }),
      },
    } as never);
    await expect(charts.getProfileHistory('danishzehen')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rebuild after hide persists only remaining listed people', async () => {
    const listed = {
      id: 'kohli',
      igUsername: 'virat.kohli',
      displayName: 'Virat Kohli',
      avatarUrl: null,
      profileUrl: 'https://instagram.com/virat.kohli/',
      category: 'Sports',
      countryRegion: 'India',
      entityType: 'person',
      isListed: true,
      isActive: true,
      scopes: [{ scope: 'india' }, { scope: 'global' }],
      metricSnapshots: [
        { metricValue: 270_000_000n, observedAt: new Date(), source: { code: 'seed_xlsx' } },
      ],
    };
    const hidden = { ...listed, id: 'fan', igUsername: 'ranbir_fan', isListed: false };

    const rankingEntry = { createMany: jest.fn().mockResolvedValue({ count: 1 }) };
    const ranking = new RankingService({
      rankingRun: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'run-2' }),
        update: jest.fn().mockResolvedValue({}),
      },
      rankingEntry,
      creatorProfile: {
        findMany: jest
          .fn()
          .mockImplementation(async ({ where }: { where: { isListed: boolean } }) =>
            [listed, hidden].filter((row) => row.isListed === where.isListed),
          ),
      },
    } as never);

    const result = await ranking.runRankingForChart(CHART_KEYS.GLOBAL_PERSONS);
    expect(result.rankedProfilesCount).toBe(1);
    expect(rankingEntry.createMany.mock.calls[0][0].data).toHaveLength(1);
    expect(rankingEntry.createMany.mock.calls[0][0].data[0].profileId).toBe('kohli');
  });
});
