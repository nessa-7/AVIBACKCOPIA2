/*
  Warnings:

  - You are about to drop the `PREDICCION_DESERCION` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `PREDICCION_DESERCION` DROP FOREIGN KEY `PREDICCION_DESERCION_aprendizId_fkey`;

-- AlterTable
ALTER TABLE `RECOMENDACION` ADD COLUMN `ranking` INTEGER NULL;

-- DropTable
DROP TABLE `PREDICCION_DESERCION`;
