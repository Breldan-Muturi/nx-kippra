/*
  Warnings:

  - You are about to drop the column `fileName` on the `PaymentReceipt` table. All the data in the column will be lost.
  - Added the required column `fileUrl` to the `PaymentReceipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentReceipt" RENAME COLUMN "fileName" TO "fileUrl";