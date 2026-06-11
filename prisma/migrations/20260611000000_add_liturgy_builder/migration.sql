-- CreateEnum
CREATE TYPE "LiturgyStatus" AS ENUM ('DRAFT', 'FINAL');

-- CreateTable
CREATE TABLE "Liturgy" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tradition" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "LiturgyStatus" NOT NULL DEFAULT 'DRAFT',
    "liturgicalDay" JSONB NOT NULL,
    "options" JSONB NOT NULL DEFAULT '{}',
    "document" JSONB,
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Liturgy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Liturgy_date_idx" ON "Liturgy"("date");

-- CreateIndex
CREATE INDEX "Liturgy_tradition_idx" ON "Liturgy"("tradition");

-- CreateIndex
CREATE INDEX "Liturgy_status_idx" ON "Liturgy"("status");

-- CreateIndex
CREATE INDEX "Liturgy_eventId_idx" ON "Liturgy"("eventId");

-- AddForeignKey
ALTER TABLE "Liturgy" ADD CONSTRAINT "Liturgy_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

