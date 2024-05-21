/*
  Warnings:

  - Changed the type of `size` on the `CompletionEvidence` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CompletionEvidence" DROP COLUMN "size",
ADD COLUMN     "size" DOUBLE PRECISION NOT NULL;
