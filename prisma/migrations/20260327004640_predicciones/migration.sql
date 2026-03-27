/*
  Warnings:

  - You are about to alter the column `estado` on the `APRENDIZ` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE `APRENDIZ` ADD COLUMN `fechaIngreso` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `estado` VARCHAR(50) NOT NULL DEFAULT 'en formacion';

-- CreateTable
CREATE TABLE `PREDICCION_DESERCION` (
    `idPREDICCION` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `riesgo` VARCHAR(50) NOT NULL,
    `probabilidad` DOUBLE NULL,
    `aprendizId` INTEGER NOT NULL,

    PRIMARY KEY (`idPREDICCION`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PREDICCION_DEMANDA` (
    `idPREDICCION` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `demanda` DOUBLE NOT NULL,
    `tendencia` VARCHAR(20) NOT NULL,
    `confianza_prediccion` DOUBLE NOT NULL DEFAULT 0,
    `trimestre_objetivo` VARCHAR(20) NOT NULL,
    `accion_sugerida` VARCHAR(20) NOT NULL,
    `programaId` INTEGER NOT NULL,

    PRIMARY KEY (`idPREDICCION`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PREDICCION_DESERCION` ADD CONSTRAINT `PREDICCION_DESERCION_aprendizId_fkey` FOREIGN KEY (`aprendizId`) REFERENCES `APRENDIZ`(`idAPRENDIZ`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PREDICCION_DEMANDA` ADD CONSTRAINT `PREDICCION_DEMANDA_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `PROGRAMA`(`idPROGRAMA`) ON DELETE RESTRICT ON UPDATE CASCADE;
