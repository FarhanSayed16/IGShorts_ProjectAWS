import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { IngestionService } from '../ingestion/ingestion.service.js';

async function runSeedImport() {
  console.log('='.repeat(60));
  console.log(' IGshorts Watchlist Seed Importer (India 200 + Global 200)');
  console.log('='.repeat(60));

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const ingestionService = app.get(IngestionService);
    const report = await ingestionService.importSeedWatchlist(
      process.argv[2],
      'cli_seed_importer',
    );

    console.log('\n--- Import Report Summary ---');
    console.log(`Status:                  ${report.status.toUpperCase()}`);
    console.log(`Total Rows in Excel:     ${report.totalRowsParsed}`);
    console.log(`Unique Profiles Stored:  ${report.uniqueProfiles}`);
    console.log(`Newly Created:           ${report.createdProfiles}`);
    console.log(`Merged / Updated:        ${report.mergedProfiles}`);
    console.log(`Missing Follower Counts: ${report.missingFollowerCounts} (stored as NULL)`);
    console.log(`Scope Breakdown:`);
    console.log(`  - India Only:          ${report.scopesCount.indiaOnly}`);
    console.log(`  - Global Only:         ${report.scopesCount.globalOnly}`);
    console.log(`  - Both Scopes (Merged):${report.scopesCount.both}`);
    console.log(`Duration:                ${report.durationMs}ms`);
    console.log(`Timestamp:               ${report.timestamp}`);

    if (report.badUsernames.length > 0) {
      console.log(`\nFlagged Bad Usernames (${report.badUsernames.length}):`);
      report.badUsernames.forEach((u) => console.log(`  - ${u}`));
    }

    console.log('='.repeat(60));
  } catch (err: any) {
    console.error('Fatal error running seed import:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeedImport();
