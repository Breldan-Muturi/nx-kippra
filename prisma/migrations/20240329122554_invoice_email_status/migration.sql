/*
  Warnings:

  - Added the required column `invoiceEmail` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'SETTLED');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "invoiceEmail" TEXT NOT NULL,
ADD COLUMN     "invoiceStatus" "InvoiceStatus" NOT NULL DEFAULT 'PENDING';
