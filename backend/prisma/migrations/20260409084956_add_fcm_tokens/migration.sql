-- AlterTable
ALTER TABLE "Environment" ADD COLUMN     "joinCriteria" TEXT DEFAULT '',
ADD COLUMN     "joinQuestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "privacyLevel" TEXT NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "EnvironmentMembership" ADD COLUMN     "answers" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "careerObjective" TEXT,
ADD COLUMN     "careerStage" TEXT NOT NULL DEFAULT 'STUDENT',
ADD COLUMN     "completionRatio" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fcmTokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "hobbies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "targetRole" TEXT,
ADD COLUMN     "techSkills" JSONB,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "websiteUrl" TEXT;

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Certification_userId_idx" ON "Certification"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
