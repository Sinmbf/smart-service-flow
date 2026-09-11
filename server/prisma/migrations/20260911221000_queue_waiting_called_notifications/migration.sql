-- Queue workflow redesign:
-- GENERATED -> WAITING, add CALLED plus timestamps for pre-call/call/grace tracking.
ALTER TYPE "TokenStatus" RENAME TO "TokenStatus_old";
CREATE TYPE "TokenStatus" AS ENUM ('WAITING', 'CALLED', 'CHECKED_IN', 'SERVING', 'COMPLETED', 'SKIPPED', 'EXPIRED', 'CANCELLED', 'DEFERRED');

ALTER TABLE "Token" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Token" ALTER COLUMN "status" TYPE "TokenStatus" USING (
  CASE "status"::text
    WHEN 'GENERATED' THEN 'WAITING'
    ELSE "status"::text
  END
)::"TokenStatus";
ALTER TABLE "Token" ALTER COLUMN "status" SET DEFAULT 'WAITING';

DROP TYPE "TokenStatus_old";

ALTER TABLE "Token" ADD COLUMN "turnApproachingNotifiedAt" TIMESTAMP(3);
ALTER TABLE "Token" ADD COLUMN "calledAt" TIMESTAMP(3);

CREATE INDEX "Token_status_calledAt_idx" ON "Token"("status", "calledAt");
