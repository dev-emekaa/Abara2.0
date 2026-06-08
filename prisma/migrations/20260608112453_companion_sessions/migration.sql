-- CreateEnum
CREATE TYPE "ThreadStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterEnum
ALTER TYPE "TimelineEventType" ADD VALUE 'COMPANION';

-- AlterTable
ALTER TABLE "CompanionThread" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "escalated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "ThreadStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "summary" TEXT;
