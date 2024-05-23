/*
  Warnings:

  - Made the column `onlineSlots` on table `TrainingSession` required. This step will fail if there are existing NULL values in that column.
  - Made the column `onlineSlotsTaken` on table `TrainingSession` required. This step will fail if there are existing NULL values in that column.
  - Made the column `onPremiseSlots` on table `TrainingSession` required. This step will fail if there are existing NULL values in that column.
  - Made the column `onPremiseSlotsTaken` on table `TrainingSession` required. This step will fail if there are existing NULL values in that column.

*/
-- Update Null values to 0
UPDATE "TrainingSession" SET "onlineSlots" = 0 WHERE "onlineSlots" IS NULL;
UPDATE "TrainingSession" SET "onlineSlotsTaken" = 0 WHERE "onlineSlotsTaken" IS NULL;
UPDATE "TrainingSession" SET "onPremiseSlots" = 0 WHERE "onPremiseSlots" IS NULL;
UPDATE "TrainingSession" SET "onPremiseSlotsTaken" = 0 WHERE "onPremiseSlotsTaken" IS NULL;

-- AlterTable
ALTER TABLE "TrainingSession" ALTER COLUMN "onlineSlots" SET NOT NULL,
ALTER COLUMN "onlineSlotsTaken" SET NOT NULL,
ALTER COLUMN "onPremiseSlots" SET NOT NULL,
ALTER COLUMN "onPremiseSlotsTaken" SET NOT NULL;
