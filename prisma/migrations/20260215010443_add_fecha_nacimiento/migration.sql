/*
  Warnings:

  - You are about to drop the column `edad` on the `ASPIRANTE` table. All the data in the column will be lost.
  - Added the required column `fechaNacimiento` to the `ASPIRANTE` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ASPIRANTE` DROP COLUMN `edad`,
    ADD COLUMN `fechaNacimiento` DATE NOT NULL;
