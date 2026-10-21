# IGshorts — Operations runbook

Use this when something is wrong in staging or production. v1 still ranks **only** from the tracked watchlist.

## Daily pipeline failed

1. Open `/admin/jobs` and read the latest `daily_ranking_pipeline` row (`failed` / `partial` / error text).
2. `/admin/sync` → **Run daily pipeline** again (admin role).
3. If sync failed handles are listed, those usernames stayed on their last **non-null** count. Do not invent zeros.
4. CloudWatch: log group `igshorts-{stage}-pipeline`. EMF metrics `IGshorts/Pipeline` `JobFailed` and `HoursSinceLastRankingRun`.
5. Rollback is **not** git revert of ranks. Ranks are computed. Fix data, then rebuild.

## Public chart looks wrong

1. Confirm the person is `isListed`, `entityType=person`, and has a non-null follower snapshot.
2. Hidden accounts need a ranking rebuild to leave the public table.
3. Movers stay empty until there are two successful runs with `rankDelta !== 0`.

## Import / bad file

1. Prefer `/admin/import` drop zone (xlsx). Server default path is the seed workbook in `docs/`.
2. Invalid handles are **skipped**, not created. Check `skipped` and `badUsernames` on the report.
3. Legacy/memorial rows (Ranbir fan, Danish Zehen, Avicii) import as **unlisted**.

## Database restore (staging drill)

RDS retains backups (7 days staging). Restore procedure:

1. AWS Console → RDS → Snapshots → restore to a **new** instance name (`igshorts-staging-restore-test`).
2. Point a throwaway ECS task or local Prisma at the restored endpoint (`DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME`).
3. `pnpm --filter @igshorts/db migrate:deploy` if the restore is behind migrations.
4. `GET /api/v1/health` and `GET /api/v1/charts/global_persons`.
5. Delete the restore instance when the drill is done. Record the date in the execution checklist.

This drill is **not** done until someone actually restores a snapshot.

## Rollback a bad deploy

CDK asset deploy: `git revert` the bad commit, then `cdk deploy IgshortsStagingStack`. Database is not rolled back with the app. If a migration is unsafe, restore RDS first.

## Secrets

JWT, admin API key, jobs secret, and the first-admin bootstrap password are generated in Secrets Manager. Do not paste demo keys.

On first ECS boot the API creates one admin from `igshorts/{stage}/admin-bootstrap` (`email` + `password`) only when `admin_users` is empty. Retrieve that secret (stack output `AdminBootstrapSecretArn`) for `/admin/login`. Rotating the secret later does **not** change the stored password hash — use a DB update for rotation.

Optional CDK context:

- `certificateArn` — HTTPS on the ALB
- `alertEmail` — SNS subscriber for alarms
- `siteUrl` — baked into the Next.js image as `NEXT_PUBLIC_SITE_URL` (set this to the public URL; ALB DNS cannot be used as a Docker build arg)
