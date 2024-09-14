/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `hotel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "hotel_name_key" ON "hotel"("name");
