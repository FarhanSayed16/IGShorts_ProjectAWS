import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CHART_KEYS } from '@igshorts/shared';
import { ChartsService } from './charts.service.js';

function createDb(overrides: Record<string, unknown> = {}) {
  return {
    rankingRun: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    rankingEntry: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
    },
    creatorProfile: {
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    ...overrides,
  };
}

describe('ChartsService', () => {
  it('rejects unknown chart keys', async () => {
    const service = new ChartsService(createDb() as never);
    await expect(service.getChartEntries('brands_v1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns empty movers until a previous successful run exists', async () => {
    const db = createDb({
      rankingRun: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce({
            id: 'run-1',
            finishedAt: new Date(),
            startedAt: new Date(),
          })
          .mockResolvedValueOnce(null),
      },
    });
    const service = new ChartsService(db as never);
    const movers = await service.getChartMovers(CHART_KEYS.GLOBAL_PERSONS);
    expect(movers.gainers).toEqual([]);
    expect(movers.losers).toEqual([]);
  });

  it('hides history for unlisted profiles', async () => {
    const db = createDb({
      creatorProfile: {
        findUnique: jest.fn().mockResolvedValue({
          igUsername: 'avicii',
          isListed: false,
          isActive: true,
          metricSnapshots: [],
          rankingEntries: [],
        }),
        count: jest.fn(),
      },
    });
    const service = new ChartsService(db as never);
    await expect(service.getProfileHistory('avicii')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('keeps null follower counts in history', async () => {
    const db = createDb({
      creatorProfile: {
        findUnique: jest.fn().mockResolvedValue({
          igUsername: 'virat.kohli',
          isListed: true,
          isActive: true,
          metricSnapshots: [
            { observedAt: new Date('2026-01-01'), metricValue: null },
            { observedAt: new Date('2026-01-02'), metricValue: 270_000_000n },
          ],
          rankingEntries: [],
        }),
        count: jest.fn(),
      },
    });
    const service = new ChartsService(db as never);
    const history = await service.getProfileHistory('virat.kohli');
    expect(history.data[0].follower_count).toBeNull();
    expect(history.data[1].follower_count).toBe(270_000_000);
  });
});
