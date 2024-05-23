-- CreateEnum
CREATE TYPE "CompletionStatus" AS ENUM ('PENDING', 'APPROVED');

-- CreateTable
CREATE TABLE "CompletedProgram" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "completionEvidence" TEXT[],
    "completionDate" TIMESTAMP(3) NOT NULL,
    "status" "CompletionStatus" NOT NULL DEFAULT 'PENDING',
    "participantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "CompletedProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompletedProgram_programId_participantId_key" ON "CompletedProgram"("programId", "participantId");

-- AddForeignKey
ALTER TABLE "CompletedProgram" ADD CONSTRAINT "CompletedProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedProgram" ADD CONSTRAINT "CompletedProgram_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedProgram" ADD CONSTRAINT "CompletedProgram_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
