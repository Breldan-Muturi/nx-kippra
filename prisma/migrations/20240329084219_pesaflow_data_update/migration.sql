/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `error_body` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `error_status_code` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `error_status_message` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_link` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `receipt_url` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `returned_an_error` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to alter the column `amount_paid` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `invoice_amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `last_payment_amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - Made the column `invoice_number` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `amount_paid` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `invoice_amount` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_payment_amount` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `payment_date` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "createdAt",
DROP COLUMN "error_body",
DROP COLUMN "error_status_code",
DROP COLUMN "error_status_message",
DROP COLUMN "invoice_link",
DROP COLUMN "receipt_url",
DROP COLUMN "returned_an_error",
DROP COLUMN "updatedAt",
ADD COLUMN     "phone_number" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "status" SET DEFAULT '',
ALTER COLUMN "client_invoice_ref" SET DEFAULT '',
ALTER COLUMN "currency" SET DEFAULT '',
ALTER COLUMN "invoice_number" SET NOT NULL,
ALTER COLUMN "payment_channel" SET DEFAULT '',
ALTER COLUMN "secure_hash" SET DEFAULT '',
ALTER COLUMN "amount_paid" SET NOT NULL,
ALTER COLUMN "amount_paid" DROP DEFAULT,
ALTER COLUMN "amount_paid" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "invoice_amount" SET NOT NULL,
ALTER COLUMN "invoice_amount" DROP DEFAULT,
ALTER COLUMN "invoice_amount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "last_payment_amount" SET NOT NULL,
ALTER COLUMN "last_payment_amount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "payment_date" SET NOT NULL;

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReference" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "payment_reference" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "inserted_at" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PaymentReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_applicationId_key" ON "Invoice"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceLink_key" ON "Invoice"("invoiceLink");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReference" ADD CONSTRAINT "PaymentReference_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
