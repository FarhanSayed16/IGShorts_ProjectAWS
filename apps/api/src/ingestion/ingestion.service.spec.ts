import { IngestionService } from './ingestion.service.js';

describe('IngestionService.syncProfiles', () => {
  const profile = {
    id: 'p1',
    igUsername: 'cristiano',
  };

  function setup(provider: string, adapter?: { fetchProfileData: jest.Mock }) {
    const db = {
      creatorProfile: {
        findMany: jest.fn().mockResolvedValue([profile]),
        update: jest.fn().mockResolvedValue(profile),
      },
      dataSource: {
        upsert: jest.fn().mockResolvedValue({ id: 'src-1', code: 'meta_graph' }),
      },
    };
    const metrics = { appendSnapshot: jest.fn().mockResolvedValue({}) };
    const seedAdapter = { normalizeUsername: (name: string) => name.toLowerCase() };
    const adapters = { forProvider: jest.fn().mockReturnValue(adapter) };
    const config = { get: jest.fn().mockReturnValue(provider) };
    const service = new IngestionService(
      db as never,
      metrics as never,
      seedAdapter as never,
      adapters as never,
      config as never,
    );
    return { service, db, metrics, adapters };
  }

  it('seed provider marks profiles synced without writing snapshots', async () => {
    const { service, metrics, db } = setup('seed', undefined);
    const report = await service.syncProfiles();
    expect(report.provider).toBe('seed');
    expect(report.synced).toBe(1);
    expect(metrics.appendSnapshot).not.toHaveBeenCalled();
    expect(db.creatorProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ lastSyncStatus: 'seed_provider' }),
      }),
    );
  });

  it('live adapter null counts are skipped and never written as zero', async () => {
    const adapter = {
      fetchProfileData: jest.fn().mockResolvedValue({
        username: 'cristiano',
        followerCount: null,
        observedAt: new Date(),
        sourceCode: 'meta_graph',
      }),
    };
    const { service, metrics } = setup('meta', adapter);
    const report = await service.syncProfiles();
    expect(report.skipped).toBe(1);
    expect(report.synced).toBe(0);
    expect(metrics.appendSnapshot).not.toHaveBeenCalled();
  });

  it('isolates per-username adapter failures', async () => {
    const adapter = {
      fetchProfileData: jest.fn().mockRejectedValue(new Error('rate limited')),
    };
    const { service } = setup('meta', adapter);
    const report = await service.syncProfiles();
    expect(report.failed).toBe(1);
    expect(report.failedHandles).toEqual(['cristiano']);
  });
});
