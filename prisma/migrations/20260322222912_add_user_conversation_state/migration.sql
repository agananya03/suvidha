-- CreateTable
CREATE TABLE "UserConversationState" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "currentStep" TEXT NOT NULL DEFAULT 'MENU',
    "department" TEXT,
    "issueType" TEXT,
    "description" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserConversationState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserConversationState_phoneNumber_key" ON "UserConversationState"("phoneNumber");
