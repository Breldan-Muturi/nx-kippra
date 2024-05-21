/*
  Warnings:

  - Changed the type of `size` on the `ProgramImage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `size` on the `UserImage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ProgramImage" DROP COLUMN "size",
ADD COLUMN     "size" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "UserImage" DROP COLUMN "size",
ADD COLUMN     "size" DOUBLE PRECISION NOT NULL;
