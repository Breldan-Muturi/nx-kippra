/*
  Warnings:

  - Made the column `status` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `client_invoice_ref` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currency` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `payment_channel` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `secure_hash` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "client_invoice_ref" SET NOT NULL,
ALTER COLUMN "client_invoice_ref" DROP DEFAULT,
ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "currency" DROP DEFAULT,
ALTER COLUMN "payment_channel" SET NOT NULL,
ALTER COLUMN "payment_channel" DROP DEFAULT,
ALTER COLUMN "secure_hash" SET NOT NULL,
ALTER COLUMN "secure_hash" DROP DEFAULT,
ALTER COLUMN "last_payment_amount" DROP DEFAULT,
ALTER COLUMN "payment_date" DROP DEFAULT,
ALTER COLUMN "phone_number" DROP DEFAULT;
