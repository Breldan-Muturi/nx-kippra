/*
  Warnings:

  - You are about to drop the column `fileName` on the `ApplicationOfferLetter` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `ApplicationProformaInvoice` table. All the data in the column will be lost.
  - Added the required column `fileUrl` to the `ApplicationOfferLetter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUrl` to the `ApplicationProformaInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApplicationOfferLetter" RENAME COLUMN "fileName" TO "fileUrl";

-- AlterTable
ALTER TABLE "ApplicationProformaInvoice" RENAME COLUMN "fileName" TO "fileUrl";