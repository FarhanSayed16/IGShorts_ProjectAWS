import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { FASTSOCIAL_LATEST_URL } from '../ingestion/creator-index/import-open-datasets.js';
import { IngestionService } from '../ingestion/ingestion.service.js';

const localFile = path.resolve(
  process.cwd(),
  '../../IGshorts_Cursor_Handoff/igshorts_bootstrap/source_downloads/fastsocial_latest.csv',
);

async function loadCsv(): Promise<{ text: string; from: string }> {
  try {
    const response = await fetch(FASTSOCIAL_LATEST_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (!text.includes('username') || !text.includes('followers')) {
      throw new Error('Downloaded file is missing the expected columns');
    }
    mkdirSync(path.dirname(localFile), { recursive: true });
    writeFileSync(localFile, text);
    return { text, from: FASTSOCIAL_LATEST_URL };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'download failed';
    console.warn(`Live download was not used (${message}). Reading the saved file.`);
    return { text: readFileSync(localFile, 'utf8'), from: localFile };
  }
}

async function run() {
  const { text, from } = await loadCsv();
  console.log(`Reading FastSocial rows from ${from}`);
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const ingestion = app.get(IngestionService);
    const result = await ingestion.importFastSocialCsv(text);
    console.log(JSON.stringify({ ...result.report, skippedRows: result.skipped, groups: result.manifest.audienceGroupCounts }, null, 2));
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
