-- Assign staff users to a government office.
-- The office assignment itself is handled by prisma/seed.js for the demo data;
-- this migration only changes the database schema.

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "officeId" TEXT;

CREATE INDEX IF NOT EXISTS "User_officeId_idx"
ON "User"("officeId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'User_officeId_fkey'
      AND conrelid = '"User"'::regclass
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_officeId_fkey"
      FOREIGN KEY ("officeId")
      REFERENCES "GovernmentOffice"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;
