/*
  Warnings:

  - You are about to drop the column `respuestaId` on the `RESPUESTAS_ASPIRANTE` table. All the data in the column will be lost.
  - You are about to drop the column `testId` on the `RESPUESTAS_ASPIRANTE` table. All the data in the column will be lost.
  - You are about to drop the `RESPUESTAS` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `valor` to the `RESPUESTAS_ASPIRANTE` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `RESPUESTAS` DROP FOREIGN KEY `RESPUESTAS_preguntaId_fkey`;

-- DropForeignKey
ALTER TABLE `RESPUESTAS_ASPIRANTE` DROP FOREIGN KEY `RESPUESTAS_ASPIRANTE_respuestaId_fkey`;

-- DropForeignKey
ALTER TABLE `RESPUESTAS_ASPIRANTE` DROP FOREIGN KEY `RESPUESTAS_ASPIRANTE_testId_fkey`;

-- DropIndex
DROP INDEX `RESPUESTAS_ASPIRANTE_respuestaId_fkey` ON `RESPUESTAS_ASPIRANTE`;

-- DropIndex
DROP INDEX `RESPUESTAS_ASPIRANTE_testId_fkey` ON `RESPUESTAS_ASPIRANTE`;

-- AlterTable
ALTER TABLE `RESPUESTAS_ASPIRANTE` DROP COLUMN `respuestaId`,
    DROP COLUMN `testId`,
    ADD COLUMN `valor` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `TEST` ADD COLUMN `nombre` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `RESPUESTAS`;
