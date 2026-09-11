-- AlterTable
-- Adds a separate "stageEnteredAt" timestamp that tracks when a token
-- started waiting in its CURRENT stage/status, distinct from
-- "generatedAt" (which is set once, at initial token creation, and
-- never changes). The no-show/expiry grace window must be measured
-- from stageEnteredAt, not generatedAt — otherwise a token that has
-- already been through one or more stages (and so has an old
-- generatedAt) gets flagged as an immediate no-show the moment it
-- reaches a later stage.
ALTER TABLE "Token" ADD COLUMN     "stageEnteredAt" TIMESTAMP(3);

-- Backfill existing rows: best-effort assume they've been waiting
-- since generatedAt (there's no better historical data to use).
UPDATE "Token" SET "stageEnteredAt" = "generatedAt" WHERE "stageEnteredAt" IS NULL;

ALTER TABLE "Token" ALTER COLUMN "stageEnteredAt" SET NOT NULL;
ALTER TABLE "Token" ALTER COLUMN "stageEnteredAt" SET DEFAULT now();
