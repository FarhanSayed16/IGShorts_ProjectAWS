import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { MetaGraphAdapter } from '../ingestion/adapters/meta-graph.adapter.js';

/**
 * Smoke-test Meta Business Discovery using env credentials.
 * Usage: node dist/scripts/meta-lookup.js [username...]
 * Default usernames: instagram
 */
async function bootstrap() {
  const handles = process.argv.slice(2).map((h) => h.replace(/^@/, '').trim()).filter(Boolean);
  const usernames = handles.length > 0 ? handles : ['instagram'];

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const meta = app.get(MetaGraphAdapter);

  console.log('--- Meta Business Discovery lookup ---');
  console.log(`Live enabled: ${meta.isEnabled()}`);
  console.log(`Handles: ${usernames.map((u) => `@${u}`).join(', ')}`);

  if (!meta.isEnabled()) {
    console.error('Meta adapter is not live. Set META_ACCESS_TOKEN (or IG_PAGE_ACCESS_TOKEN) + IG_BUSINESS_ID in apps/api/.env');
    await app.close();
    process.exit(1);
  }

  const results = await meta.fetchBatch(usernames);
  for (const row of results) {
    console.log(
      JSON.stringify(
        {
          username: row.username,
          displayName: row.displayName ?? null,
          followers: row.followerCount === null || row.followerCount === undefined ? null : row.followerCount.toString(),
          profileUrl: row.profileUrl ?? null,
          hasAvatar: Boolean(row.avatarUrl),
          observedAt: row.observedAt.toISOString(),
          source: row.sourceCode,
        },
        null,
        2,
      ),
    );
  }

  const ok = results.some((r) => r.followerCount != null);
  // Avoid Windows libuv assert on Nest application-context teardown.
  try {
    await app.close();
  } catch {
    // ignore close races
  }
  process.exit(ok ? 0 : 2);
}

bootstrap().catch((err) => {
  console.error('meta-lookup failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
