/**
 * Records whether the Meta five-check and a licensed 100-handle trial can run.
 * It does not call Instagram, and it does not call a paid API.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@igshorts/db';

function envValue(text: string, key: string): string {
  const line = text.split(/\r?\n/).find((row) => row.startsWith(`${key}=`));
  if (!line) return '';
  return line.slice(key.length + 1).trim().replace(/^["']|["']$/g, '');
}

function present(value: string): boolean {
  return value.length > 0;
}

async function main() {
  const envPath = resolve(process.cwd(), '.env');
  const envText = readFileSync(envPath, 'utf8');
  const databaseUrl = envValue(envText, 'DATABASE_URL');
  if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
  const provider = envValue(envText, 'PROVIDER') || 'seed';
  const metaToken = present(envValue(envText, 'META_ACCESS_TOKEN'));
  const metaApp = present(envValue(envText, 'META_APP_ID'));
  const influencers = present(envValue(envText, 'INFLUENCERS_CLUB_API_KEY'));
  const modash = present(envValue(envText, 'MODASH_API_KEY'));
  const metaLive = provider === 'meta' && metaToken;

  let savedHandles = 0;
  let database = 'not reached';
  if (databaseUrl) {
    const db = new PrismaClient();
    try {
      savedHandles = await db.creatorProfile.count({
        where: { isListed: true, isActive: true },
      });
      database = `reached, ${savedHandles} listed profiles`;
    } catch {
      database = 'not reached';
    } finally {
      await db.$disconnect().catch(() => undefined);
    }
  }

  const metaRows = [
    ['Own professional account', metaLive ? 'ready to call' : 'not run — live Meta is off'],
    ['Public creator we do not control', metaLive ? 'ready to call' : 'not run — live Meta is off'],
    ['Personal account, expected empty', metaLive ? 'ready to call' : 'not run — live Meta is off'],
    ['Fields and limits', metaLive ? 'ready to call' : 'not run — live Meta is off'],
    ['App Review permissions we can obtain', 'not submitted'],
  ];

  const sampleReady = savedHandles >= 100;
  const licensedReady = influencers || modash;
  const lines = [
    '# Provider benchmark — 27 October 2026',
    '',
    'This is the recorded result of the check. It is not a decision to buy a feed, and it does not turn on new-handle search.',
    '',
    '## Meta five-check',
    '',
    `Provider mode is \`${provider}\`. A Meta app id is ${metaApp ? 'present' : 'absent'}. A Meta access token is ${metaToken ? 'present' : 'absent'}. Live calls stay off unless the provider is Meta and a token exists.`,
    '',
    '| Check | Result |',
    '|---|---|',
    ...metaRows.map(([name, result]) => `| ${name} | ${result} |`),
    '',
    'Business Discovery is not proven. A new professional handle is not looked up.',
    '',
    '## Licensed 100-handle trial',
    '',
    `Saved-profile database: ${database}.`,
    `A list of about 100 known handles is ${sampleReady ? 'available in the saved set' : 'not loaded for this run'}.`,
    `Influencers Club key: ${influencers ? 'present' : 'absent'}. Modash key: ${modash ? 'present' : 'absent'}.`,
    '',
    licensedReady
      ? 'A key is present, but this run still does not call the vendor. A written right to store and display the count is required before any paid lookup.'
      : 'No licensed lookup was made. There is no API key and no written right to display a vendor count.',
    '',
    '## Decision',
    '',
    'Do not pay for Influencers Club or Modash from this run. Do not promise search for a handle we have not already saved. The audience group on saved profiles can ship without this proof.',
    '',
  ];

  const out = resolve(process.cwd(), '../../docs/IGshorts_Provider_Benchmark.md');
  writeFileSync(out, lines.join('\n'), 'utf8');
  console.log(JSON.stringify({ provider, metaLive, database, savedHandles, influencers, modash, out }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
