-- CreateTable
CREATE TABLE IF NOT EXISTS "claim_requests" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending_verification',
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claim_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "claim_requests_handle_createdAt_idx" ON "claim_requests"("handle", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "claim_requests_status_createdAt_idx" ON "claim_requests"("status", "createdAt");
