# AWS CDK Infrastructure (TypeScript)

IGshorts staging stack for `ap-south-1`. This is scaffolding until the first successful `cdk deploy`.

## What it creates

- VPC (public / private compute / isolated DB)
- RDS PostgreSQL 16
- ECS Fargate: API, Next.js web, daily pipeline task
- ALB: `/` → web, `/api/*` → API
- WAF, S3 imports bucket, Secrets Manager, CloudWatch alarms, SNS

Docker images build from the **repo root** (`apps/api/Dockerfile`, `apps/web/Dockerfile`). The API assembles `DATABASE_URL` from RDS secret fields (`host`, `port`, `username`, `password`, `dbname`).

## Optional context

```bash
pnpm --filter @igshorts/infra cdk deploy IgshortsStagingStack \
  --context certificateArn=arn:aws:acm:ap-south-1:...:certificate/... \
  --context alertEmail=ops@example.com \
  --context siteUrl=https://your-staging-host.example
```

Without `certificateArn`, the ALB is HTTP-only. HTTPS is required before calling staging “done”.

The web image is built with `NEXT_PUBLIC_API_URL=/api/v1` (same-origin ALB path routing). Pass `siteUrl` so Open Graph / JSON-LD do not fall back to localhost. First admin credentials are in Secrets Manager (`AdminBootstrapSecretArn` output).

## Restore drill (Phase 10)

RDS retains backups (7 days staging / 30 days prod). After first deploy, restore a snapshot to a throwaway instance once and record it in the checklist.
