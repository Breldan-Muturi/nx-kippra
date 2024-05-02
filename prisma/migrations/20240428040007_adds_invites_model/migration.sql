/*
  Warnings:

  - You are about to drop the column `invites` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "invites";

-- CreateTable
CREATE TABLE "InviteOrganization" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InviteOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InviteOrganization_token_key" ON "InviteOrganization"("token");

-- CreateIndex
CREATE UNIQUE INDEX "InviteOrganization_email_token_key" ON "InviteOrganization"("email", "token");

-- AddForeignKey
ALTER TABLE "InviteOrganization" ADD CONSTRAINT "InviteOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
