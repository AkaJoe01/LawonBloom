-- AlterTable
ALTER TABLE "Post" ADD COLUMN "noindex" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN "readAt" TIMESTAMP(3);
