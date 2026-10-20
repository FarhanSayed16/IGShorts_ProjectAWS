import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  const host = process.env.HOST || '0.0.0.0';
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  const originList = corsOrigin
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  (BigInt.prototype as unknown as { toJSON?: () => string }).toJSON = function toJSON() {
    return this.toString();
  };

  // Versioned API Prefix
  app.setGlobalPrefix(apiPrefix);

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Logging Interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.register(multipart as any, {
    limits: { fileSize: 15 * 1024 * 1024 },
  });

  // Register Security Headers via Helmet
  await app.register(helmet as any, {
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  });

  // Register Rate Limiting on public API endpoints (100 req/min per IP default)
  await app.register(rateLimit as any, {
    max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 120,
    timeWindow: '1 minute',
  });

  // Enable CORS
  const allowCredentials = !originList.includes('*');
  app.enableCors({
    origin: originList.includes('*') ? true : originList,
    credentials: allowCredentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.listen(port, host);
  console.log(`[IGshorts API] Server running on http://${host}:${port}/${apiPrefix}`);
}

bootstrap().catch((err) => {
  console.error('[IGshorts API] Fatal bootstrap error:', err);
  process.exit(1);
});
