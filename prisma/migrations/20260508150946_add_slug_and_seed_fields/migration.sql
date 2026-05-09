/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Background` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Proficiency` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Race` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Skill` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Spell` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Subrace` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Background` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Proficiency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Race` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Spell` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Subrace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `background` ADD COLUMN `equipmentGranted` JSON NULL,
    ADD COLUMN `languagesGranted` JSON NULL,
    ADD COLUMN `skillProficiencies` JSON NULL,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL,
    ADD COLUMN `toolProficiencies` JSON NULL;

-- AlterTable
ALTER TABLE `class` ADD COLUMN `proficiencies` JSON NULL,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `classfeature` ADD COLUMN `slug` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `item` ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `damageType` VARCHAR(191) NULL,
    ADD COLUMN `dexterityModifier` VARCHAR(191) NULL,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL,
    ADD COLUMN `stealthDisadvantage` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `proficiency` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `race` ADD COLUMN `features` JSON NULL,
    ADD COLUMN `languages` JSON NULL,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `skill` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `spell` ADD COLUMN `concentration` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `damageType` VARCHAR(191) NULL,
    ADD COLUMN `ritual` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `subrace` ADD COLUMN `features` JSON NULL,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Background_slug_key` ON `Background`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `Class_slug_key` ON `Class`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `Item_slug_key` ON `Item`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `Proficiency_slug_key` ON `Proficiency`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `Race_slug_key` ON `Race`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `Skill_slug_key` ON `Skill`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `Spell_slug_key` ON `Spell`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `Subrace_slug_key` ON `Subrace`(`slug`);
