import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { JobsService } from '../jobs/jobs.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const jobsService = app.get(JobsService);

  console.log('--- IGshorts Daily Pipeline Runner ---');
  const report = await jobsService.runDailyPipeline();

  console.log('Pipeline Result:');
  console.log(JSON.stringify(report, null, 2));

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Pipeline script encountered an error:', err);
  process.exit(1);
});
