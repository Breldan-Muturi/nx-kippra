/*
  Warnings:

  - You are about to drop the column `amount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceLink` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDescription` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `receivedFrom` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[applicationId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `applicationId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `returned_an_error` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "amount",
DROP COLUMN "date",
DROP COLUMN "invoiceLink",
DROP COLUMN "method",
DROP COLUMN "paymentDescription",
DROP COLUMN "receivedFrom",
ADD COLUMN     "amount_paid" TEXT,
ADD COLUMN     "applicationId" TEXT NOT NULL,
ADD COLUMN     "client_invoice_ref" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "error_body" TEXT,
ADD COLUMN     "error_status_code" TEXT,
ADD COLUMN     "error_status_message" TEXT,
ADD COLUMN     "invoice_amount" TEXT,
ADD COLUMN     "invoice_link" TEXT,
ADD COLUMN     "invoice_number" TEXT,
ADD COLUMN     "last_payment_amount" TEXT,
ADD COLUMN     "payment_channel" TEXT,
ADD COLUMN     "payment_date" TEXT,
ADD COLUMN     "returned_an_error" BOOLEAN NOT NULL,
ADD COLUMN     "secure_hash" TEXT,
ALTER COLUMN "status" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_applicationId_key" ON "Payment"("applicationId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
