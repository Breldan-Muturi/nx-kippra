/*
  Warnings:

  - The `amount_paid` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `invoice_amount` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `last_payment_amount` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `payment_date` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "amount_paid",
ADD COLUMN     "amount_paid" DECIMAL(65,30) DEFAULT 1.00,
DROP COLUMN "invoice_amount",
ADD COLUMN     "invoice_amount" DECIMAL(65,30) DEFAULT 1.00,
DROP COLUMN "last_payment_amount",
ADD COLUMN     "last_payment_amount" DECIMAL(65,30) DEFAULT 1.00,
DROP COLUMN "payment_date",
ADD COLUMN     "payment_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
