ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "createdById" INTEGER,
  ADD COLUMN IF NOT EXISTS "college" TEXT,
  ADD COLUMN IF NOT EXISTS "profileImage" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'User_createdById_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_createdById_fkey"
      FOREIGN KEY ("createdById") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
