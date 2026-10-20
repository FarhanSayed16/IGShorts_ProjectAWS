export interface AppConfig {
  nodeEnv: string;
  port: number;
  host: string;
  apiPrefix: string;
  corsOrigin: string;
  databaseUrl: string;
  provider: 'seed' | 'meta';
  awsRegion: string;
  adminJwtSecret: string;
  adminApiKey: string;
  jobsSecret: string;
  adminBootstrapEmail: string;
  adminBootstrapPassword: string;
  s3BucketImports: string;
  cronEnabled: boolean;
}

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || '5432';
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const name = process.env.DB_NAME || 'igshorts_db';
  if (host && user && password) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${name}?schema=public`;
  }
  return '';
}

export default (): { app: AppConfig } => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),
    host: process.env.HOST || '0.0.0.0',
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    databaseUrl: resolveDatabaseUrl(),
    provider: process.env.PROVIDER === 'meta' ? 'meta' : 'seed',
    awsRegion: process.env.AWS_REGION || 'ap-south-1',
    adminJwtSecret: process.env.ADMIN_JWT_SECRET || '',
    adminApiKey: process.env.ADMIN_API_KEY || '',
    jobsSecret: process.env.JOBS_SECRET || '',
    adminBootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL || '',
    adminBootstrapPassword: process.env.ADMIN_BOOTSTRAP_PASSWORD || '',
    s3BucketImports: process.env.S3_BUCKET_IMPORTS || '',
    cronEnabled: process.env.CRON_ENABLED === 'true',
  },
});
