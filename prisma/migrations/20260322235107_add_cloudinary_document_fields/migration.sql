-- CreateTable
CREATE TABLE "DocumentToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "cloudinaryUrl" TEXT,
    "cloudinaryId" TEXT,
    "serviceType" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentToken_token_key" ON "DocumentToken"("token");
