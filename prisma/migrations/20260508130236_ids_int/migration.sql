/*
  Warnings:

  - The primary key for the `background` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `background` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `character` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `character` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `userId` on the `character` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `raceId` on the `character` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `subraceId` on the `character` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `classId` on the `character` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `backgroundId` on the `character` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `characteritem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `characteritem` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `characterId` on the `characteritem` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `itemId` on the `characteritem` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `characterproficiency` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `characterproficiency` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `characterId` on the `characterproficiency` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `proficiencyId` on the `characterproficiency` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `characterskill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `characterskill` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `characterId` on the `characterskill` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `skillId` on the `characterskill` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `characterspell` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `characterspell` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `characterId` on the `characterspell` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `spellId` on the `characterspell` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `class` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `class` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `classfeature` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `classfeature` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `classId` on the `classfeature` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `feature` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `feature` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `item` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `item` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `proficiency` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `proficiency` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `race` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `race` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `racebonus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `racebonus` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `raceId` on the `racebonus` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `session` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `masterUserId` on the `session` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `sessionaccess` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `sessionId` on the `sessionaccess` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `userId` on the `sessionaccess` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `skill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `skill` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `spell` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `spell` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `subrace` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `subrace` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `raceId` on the `subrace` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `character` DROP FOREIGN KEY `Character_backgroundId_fkey`;

-- DropForeignKey
ALTER TABLE `character` DROP FOREIGN KEY `Character_classId_fkey`;

-- DropForeignKey
ALTER TABLE `character` DROP FOREIGN KEY `Character_raceId_fkey`;

-- DropForeignKey
ALTER TABLE `character` DROP FOREIGN KEY `Character_subraceId_fkey`;

-- DropForeignKey
ALTER TABLE `character` DROP FOREIGN KEY `Character_userId_fkey`;

-- DropForeignKey
ALTER TABLE `characteritem` DROP FOREIGN KEY `CharacterItem_characterId_fkey`;

-- DropForeignKey
ALTER TABLE `characteritem` DROP FOREIGN KEY `CharacterItem_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `characterproficiency` DROP FOREIGN KEY `CharacterProficiency_characterId_fkey`;

-- DropForeignKey
ALTER TABLE `characterproficiency` DROP FOREIGN KEY `CharacterProficiency_proficiencyId_fkey`;

-- DropForeignKey
ALTER TABLE `characterskill` DROP FOREIGN KEY `CharacterSkill_characterId_fkey`;

-- DropForeignKey
ALTER TABLE `characterskill` DROP FOREIGN KEY `CharacterSkill_skillId_fkey`;

-- DropForeignKey
ALTER TABLE `characterspell` DROP FOREIGN KEY `CharacterSpell_characterId_fkey`;

-- DropForeignKey
ALTER TABLE `characterspell` DROP FOREIGN KEY `CharacterSpell_spellId_fkey`;

-- DropForeignKey
ALTER TABLE `classfeature` DROP FOREIGN KEY `ClassFeature_classId_fkey`;

-- DropForeignKey
ALTER TABLE `racebonus` DROP FOREIGN KEY `RaceBonus_raceId_fkey`;

-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `Session_masterUserId_fkey`;

-- DropForeignKey
ALTER TABLE `sessionaccess` DROP FOREIGN KEY `SessionAccess_sessionId_fkey`;

-- DropForeignKey
ALTER TABLE `sessionaccess` DROP FOREIGN KEY `SessionAccess_userId_fkey`;

-- DropForeignKey
ALTER TABLE `subrace` DROP FOREIGN KEY `Subrace_raceId_fkey`;

-- DropIndex
DROP INDEX `Character_backgroundId_fkey` ON `character`;

-- DropIndex
DROP INDEX `Character_subraceId_fkey` ON `character`;

-- AlterTable
ALTER TABLE `background` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `character` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `userId` INTEGER NOT NULL,
    MODIFY `raceId` INTEGER NULL,
    MODIFY `subraceId` INTEGER NULL,
    MODIFY `classId` INTEGER NULL,
    MODIFY `backgroundId` INTEGER NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `characteritem` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `characterId` INTEGER NOT NULL,
    MODIFY `itemId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `characterproficiency` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `characterId` INTEGER NOT NULL,
    MODIFY `proficiencyId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `characterskill` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `characterId` INTEGER NOT NULL,
    MODIFY `skillId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `characterspell` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `characterId` INTEGER NOT NULL,
    MODIFY `spellId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `class` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `classfeature` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `classId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `feature` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `item` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `proficiency` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `race` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `racebonus` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `raceId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `session` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `masterUserId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `sessionaccess` DROP PRIMARY KEY,
    MODIFY `sessionId` INTEGER NOT NULL,
    MODIFY `userId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`sessionId`, `userId`);

-- AlterTable
ALTER TABLE `skill` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `spell` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `subrace` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `raceId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_masterUserId_fkey` FOREIGN KEY (`masterUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionAccess` ADD CONSTRAINT `SessionAccess_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionAccess` ADD CONSTRAINT `SessionAccess_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Character` ADD CONSTRAINT `Character_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Character` ADD CONSTRAINT `Character_raceId_fkey` FOREIGN KEY (`raceId`) REFERENCES `Race`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Character` ADD CONSTRAINT `Character_subraceId_fkey` FOREIGN KEY (`subraceId`) REFERENCES `Subrace`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Character` ADD CONSTRAINT `Character_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Character` ADD CONSTRAINT `Character_backgroundId_fkey` FOREIGN KEY (`backgroundId`) REFERENCES `Background`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subrace` ADD CONSTRAINT `Subrace_raceId_fkey` FOREIGN KEY (`raceId`) REFERENCES `Race`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaceBonus` ADD CONSTRAINT `RaceBonus_raceId_fkey` FOREIGN KEY (`raceId`) REFERENCES `Race`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassFeature` ADD CONSTRAINT `ClassFeature_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterSkill` ADD CONSTRAINT `CharacterSkill_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterSkill` ADD CONSTRAINT `CharacterSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterProficiency` ADD CONSTRAINT `CharacterProficiency_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterProficiency` ADD CONSTRAINT `CharacterProficiency_proficiencyId_fkey` FOREIGN KEY (`proficiencyId`) REFERENCES `Proficiency`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterItem` ADD CONSTRAINT `CharacterItem_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterItem` ADD CONSTRAINT `CharacterItem_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterSpell` ADD CONSTRAINT `CharacterSpell_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterSpell` ADD CONSTRAINT `CharacterSpell_spellId_fkey` FOREIGN KEY (`spellId`) REFERENCES `Spell`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
