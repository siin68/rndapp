-- Add parentEventId to Event table for sub-events
ALTER TABLE "Event" ADD COLUMN "parentEventId" INTEGER;

-- Add foreign key constraint
ALTER TABLE "Event" ADD CONSTRAINT "Event_parentEventId_fkey" 
  FOREIGN KEY ("parentEventId") REFERENCES "Event"("id") ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX "Event_parentEventId_idx" ON "Event"("parentEventId");
