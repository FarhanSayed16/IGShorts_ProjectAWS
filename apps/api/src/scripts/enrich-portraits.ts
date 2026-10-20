import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { WikipediaEnrichmentService } from '../ingestion/wikipedia.enrichment.js';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const enrichment = app.get(WikipediaEnrichmentService);
    const report = await enrichment.enrichListedPeople();
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
