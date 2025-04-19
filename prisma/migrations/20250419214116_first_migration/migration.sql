-- CreateEnum
CREATE TYPE "PreservationStageEnum" AS ENUM ('INICIADA', 'PRESERVADO', 'FALHA');

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "preservationStage" "PreservationStageEnum" NOT NULL,
    "metadata" JSONB NOT NULL,
    "SIPuuid" TEXT NOT NULL,
    "transferUUID" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
