-- DropForeignKey
ALTER TABLE "CompletedProgram" DROP CONSTRAINT "CompletedProgram_programId_fkey";

-- AlterTable
ALTER TABLE "ApplicationOfferLetter" ADD COLUMN     "contentType" TEXT NOT NULL DEFAULT 'application/pdf',
ADD COLUMN     "size" DOUBLE PRECISION NOT NULL DEFAULT 20000;

-- AlterTable
ALTER TABLE "ApplicationProformaInvoice" ADD COLUMN     "contentType" TEXT NOT NULL DEFAULT 'application/pdf',
ADD COLUMN     "size" DOUBLE PRECISION NOT NULL DEFAULT 20000;

-- AlterTable
ALTER TABLE "PaymentReceipt" ADD COLUMN     "contentType" TEXT NOT NULL DEFAULT 'application/pdf',
ADD COLUMN     "size" DOUBLE PRECISION NOT NULL DEFAULT 20000;

-- CreateTable
CREATE TABLE "UserImage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompletionEvidence" (
    "id" TEXT NOT NULL,
    "completedProgramId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompletionEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramImage" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgImage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserImage_userId_key" ON "UserImage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramImage_programId_key" ON "ProgramImage"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgImage_organizationId_key" ON "OrgImage"("organizationId");

-- AddForeignKey
ALTER TABLE "UserImage" ADD CONSTRAINT "UserImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedProgram" ADD CONSTRAINT "CompletedProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletionEvidence" ADD CONSTRAINT "CompletionEvidence_completedProgramId_fkey" FOREIGN KEY ("completedProgramId") REFERENCES "CompletedProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramImage" ADD CONSTRAINT "ProgramImage_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgImage" ADD CONSTRAINT "OrgImage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
