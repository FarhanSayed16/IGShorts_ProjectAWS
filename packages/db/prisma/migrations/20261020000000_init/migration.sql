-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "data_sources" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_profiles" (
    "id" TEXT NOT NULL,
    "ig_username" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "profile_url" TEXT NOT NULL,
    "avatar_url" TEXT,
    "entity_type" TEXT NOT NULL DEFAULT 'person',
    "category" TEXT,
    "country_region" TEXT,
    "is_listed" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified_handle" BOOLEAN NOT NULL DEFAULT false,
    "ig_user_id" TEXT,
    "last_synced_at" TIMESTAMP(3),
    "last_sync_status" TEXT,
    "last_sync_error" TEXT,
    "seed_rank" INTEGER,
    "seed_confidence" TEXT,
    "seed_notes" TEXT,
    "ranking_source_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_scopes" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_scopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_snapshots" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "metric_name" TEXT NOT NULL DEFAULT 'follower_count',
    "metric_value" BIGINT,
    "observed_at" TIMESTAMP(3) NOT NULL,
    "ingested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_payload_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metric_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_runs" (
    "id" TEXT NOT NULL,
    "chart_key" TEXT NOT NULL,
    "algorithm_version" TEXT NOT NULL DEFAULT 'followers_v1',
    "status" TEXT NOT NULL DEFAULT 'running',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "profile_count" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_entries" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "previous_rank" INTEGER,
    "rank_delta" INTEGER NOT NULL DEFAULT 0,
    "metric_value" BIGINT,
    "previous_metric_value" BIGINT,
    "metric_delta" BIGINT NOT NULL DEFAULT 0,
    "is_tied" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "before_summary" TEXT,
    "after_summary" TEXT,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_runs" (
    "id" TEXT NOT NULL,
    "job_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "stats" TEXT,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "data_sources_code_key" ON "data_sources"("code");

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_ig_username_key" ON "creator_profiles"("ig_username");

-- CreateIndex
CREATE INDEX "creator_profiles_entity_type_idx" ON "creator_profiles"("entity_type");

-- CreateIndex
CREATE INDEX "creator_profiles_is_listed_is_active_idx" ON "creator_profiles"("is_listed", "is_active");

-- CreateIndex
CREATE INDEX "profile_scopes_scope_idx" ON "profile_scopes"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "profile_scopes_profile_id_scope_key" ON "profile_scopes"("profile_id", "scope");

-- CreateIndex
CREATE INDEX "metric_snapshots_profile_id_metric_name_observed_at_idx" ON "metric_snapshots"("profile_id", "metric_name", "observed_at" DESC);

-- CreateIndex
CREATE INDEX "ranking_runs_chart_key_status_finished_at_idx" ON "ranking_runs"("chart_key", "status", "finished_at" DESC);

-- CreateIndex
CREATE INDEX "ranking_entries_run_id_rank_idx" ON "ranking_entries"("run_id", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "ranking_entries_run_id_profile_id_key" ON "ranking_entries"("run_id", "profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at" DESC);

-- CreateIndex
CREATE INDEX "job_runs_job_name_started_at_idx" ON "job_runs"("job_name", "started_at" DESC);

-- AddForeignKey
ALTER TABLE "profile_scopes" ADD CONSTRAINT "profile_scopes_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "creator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_snapshots" ADD CONSTRAINT "metric_snapshots_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "creator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_snapshots" ADD CONSTRAINT "metric_snapshots_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_entries" ADD CONSTRAINT "ranking_entries_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "ranking_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_entries" ADD CONSTRAINT "ranking_entries_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "creator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
