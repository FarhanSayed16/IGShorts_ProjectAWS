-- AlterTable
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "last_visited_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "trend_topics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'both',
    "summary" TEXT,
    "image_url" TEXT,
    "source_url" TEXT,
    "source_name" TEXT,
    "source_label" TEXT NOT NULL DEFAULT 'editorial',
    "popularity_score" DOUBLE PRECISION,
    "velocity_score" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'new',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "observed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trend_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "music_tracks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "artwork_url" TEXT,
    "spotify_url" TEXT,
    "youtube_url" TEXT,
    "region" TEXT NOT NULL DEFAULT 'both',
    "popularity_score" DOUBLE PRECISION,
    "collections" TEXT[],
    "creator_usage_count" INTEGER,
    "source_label" TEXT NOT NULL DEFAULT 'editorial',
    "release_date" TIMESTAMP(3),
    "observed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "music_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "daily_pulse_items" (
    "id" TEXT NOT NULL,
    "pulse_date" DATE NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "image_url" TEXT,
    "link_url" TEXT,
    "trend_topic_id" TEXT,
    "music_track_id" TEXT,
    "profile_id" TEXT,
    "source_label" TEXT NOT NULL DEFAULT 'editorial',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_pulse_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "trend_topics_slug_key" ON "trend_topics"("slug");
CREATE INDEX IF NOT EXISTS "trend_topics_category_region_status_idx" ON "trend_topics"("category", "region", "status");
CREATE INDEX IF NOT EXISTS "trend_topics_is_featured_idx" ON "trend_topics"("is_featured");
CREATE INDEX IF NOT EXISTS "trend_topics_observed_at_idx" ON "trend_topics"("observed_at" DESC);

CREATE INDEX IF NOT EXISTS "music_tracks_region_idx" ON "music_tracks"("region");
CREATE INDEX IF NOT EXISTS "music_tracks_observed_at_idx" ON "music_tracks"("observed_at" DESC);

CREATE UNIQUE INDEX IF NOT EXISTS "daily_pulse_items_pulse_date_kind_key" ON "daily_pulse_items"("pulse_date", "kind");
CREATE INDEX IF NOT EXISTS "daily_pulse_items_pulse_date_idx" ON "daily_pulse_items"("pulse_date" DESC);

DO $$ BEGIN
  ALTER TABLE "daily_pulse_items" ADD CONSTRAINT "daily_pulse_items_trend_topic_id_fkey"
    FOREIGN KEY ("trend_topic_id") REFERENCES "trend_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "daily_pulse_items" ADD CONSTRAINT "daily_pulse_items_music_track_id_fkey"
    FOREIGN KEY ("music_track_id") REFERENCES "music_tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "daily_pulse_items" ADD CONSTRAINT "daily_pulse_items_profile_id_fkey"
    FOREIGN KEY ("profile_id") REFERENCES "creator_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
