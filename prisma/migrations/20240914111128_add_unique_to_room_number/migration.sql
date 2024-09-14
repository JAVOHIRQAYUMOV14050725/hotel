/*
  Warnings:

  - A unique constraint covering the columns `[roomNumber]` on the table `room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomNumber` to the `room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "room" ADD COLUMN     "roomNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "room_roomNumber_key" ON "room"("roomNumber");
