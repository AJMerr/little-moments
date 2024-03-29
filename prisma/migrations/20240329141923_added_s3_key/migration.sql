/*
  Warnings:

  - Added the required column `s3Key` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "s3Key" TEXT NOT NULL;
