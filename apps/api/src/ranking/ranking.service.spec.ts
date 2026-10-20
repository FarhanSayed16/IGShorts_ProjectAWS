import { BadRequestException } from '@nestjs/common';
import { CHART_KEYS } from '@igshorts/shared';
import { RankingService } from './ranking.service.js';

describe('RankingService', () => {
  it('rejects unknown chart keys', async () => {
    const service = new RankingService({} as never);
    await expect(service.runRankingForChart('brands_v1' as never)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('queries only listed active profiles and marks persist failures as failed', async () => {
    const rankingRun = {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'run-1' }),
      update: jest.fn().mockResolvedValue({}),
    };
    const rankingEntry = {
      createMany: jest.fn().mockRejectedValue(new Error('persist failed')),
    };
    const creatorProfile = {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'p1',
          igUsername: 'cristiano',
          displayName: 'Cristiano',
          avatarUrl: null,
          profileUrl: 'https://instagram.com/cristiano/',
          category: 'Sports',
          countryRegion: 'Portugal',
          entityType: 'person',
          isListed: true,
          isActive: true,
          scopes: [{ scope: 'global' }],
          metricSnapshots: [
            { metricValue: 600_000_000n, observedAt: new Date(), source: { code: 'seed_xlsx' } },
          ],
        },
        {
          id: 'hidden',
          igUsername: 'avicii',
          displayName: 'Avicii',
          avatarUrl: null,
          profileUrl: 'https://instagram.com/avicii/',
          category: 'Music',
          countryRegion: 'Sweden',
          entityType: 'person',
          isListed: false,
          isActive: true,
          scopes: [{ scope: 'global' }],
          metricSnapshots: [
            { metricValue: 10n, observedAt: new Date(), source: { code: 'seed_xlsx' } },
          ],
        },
      ]),
    };

    const service = new RankingService({ rankingRun, rankingEntry, creatorProfile } as never);
    await expect(service.runRankingForChart(CHART_KEYS.GLOBAL_PERSONS)).rejects.toThrow(
      'persist failed',
    );

    expect(creatorProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isListed: true, isActive: true },
      }),
    );
    expect(rankingRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'failed' }),
      }),
    );
  });

  it('does not persist hidden profiles even if the mock still returns them', async () => {
    const rankingRun = {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'run-1' }),
      update: jest.fn().mockResolvedValue({}),
    };
    const rankingEntry = {
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
    };
    const creatorProfile = {
      findMany: jest
        .fn()
        .mockImplementation(async ({ where }: { where: { isListed: boolean } }) => {
          const rows = [
            {
              id: 'p1',
              igUsername: 'cristiano',
              displayName: 'Cristiano',
              avatarUrl: null,
              profileUrl: 'https://instagram.com/cristiano/',
              category: 'Sports',
              countryRegion: 'Portugal',
              entityType: 'person',
              isListed: true,
              isActive: true,
              scopes: [{ scope: 'global' }],
              metricSnapshots: [
                {
                  metricValue: 600_000_000n,
                  observedAt: new Date(),
                  source: { code: 'seed_xlsx' },
                },
              ],
            },
            {
              id: 'hidden',
              igUsername: 'avicii',
              displayName: 'Avicii',
              avatarUrl: null,
              profileUrl: 'https://instagram.com/avicii/',
              category: 'Music',
              countryRegion: 'Sweden',
              entityType: 'person',
              isListed: false,
              isActive: true,
              scopes: [{ scope: 'global' }],
              metricSnapshots: [
                { metricValue: 10n, observedAt: new Date(), source: { code: 'seed_xlsx' } },
              ],
            },
          ];
          return rows.filter((row) => row.isListed === where.isListed);
        }),
    };

    const service = new RankingService({ rankingRun, rankingEntry, creatorProfile } as never);
    const result = await service.runRankingForChart(CHART_KEYS.GLOBAL_PERSONS);
    expect(result.rankedProfilesCount).toBe(1);
    expect(rankingEntry.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [expect.objectContaining({ profileId: 'p1', rank: 1 })],
      }),
    );
  });
});
