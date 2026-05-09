-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `role` ENUM('mestre', 'jogador') NOT NULL DEFAULT 'jogador',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `masterUserId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `style` VARCHAR(191) NOT NULL DEFAULT 'outro',
    `startAt` DATETIME(3) NOT NULL,
    `initialLevel` INTEGER NOT NULL DEFAULT 1,
    `worldRestrictions` VARCHAR(191) NULL,
    `coverImageUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Session_masterUserId_idx`(`masterUserId`),
    INDEX `Session_startAt_idx`(`startAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SessionAccess` (
    `sessionId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SessionAccess_userId_idx`(`userId`),
    PRIMARY KEY (`sessionId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Character` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `age` INTEGER NULL,
    `gender` ENUM('masculino', 'feminino', 'nao_binario', 'outro') NULL,
    `alignment` VARCHAR(191) NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `xp` INTEGER NOT NULL DEFAULT 0,
    `raceId` VARCHAR(191) NULL,
    `subraceId` VARCHAR(191) NULL,
    `classId` VARCHAR(191) NULL,
    `backgroundId` VARCHAR(191) NULL,
    `strength` INTEGER NOT NULL DEFAULT 10,
    `dexterity` INTEGER NOT NULL DEFAULT 10,
    `constitution` INTEGER NOT NULL DEFAULT 10,
    `intelligence` INTEGER NOT NULL DEFAULT 10,
    `wisdom` INTEGER NOT NULL DEFAULT 10,
    `charisma` INTEGER NOT NULL DEFAULT 10,
    `strengthModifier` INTEGER NOT NULL DEFAULT 0,
    `dexterityModifier` INTEGER NOT NULL DEFAULT 0,
    `constitutionModifier` INTEGER NOT NULL DEFAULT 0,
    `intelligenceModifier` INTEGER NOT NULL DEFAULT 0,
    `wisdomModifier` INTEGER NOT NULL DEFAULT 0,
    `charismaModifier` INTEGER NOT NULL DEFAULT 0,
    `armorClass` INTEGER NOT NULL DEFAULT 10,
    `initiative` INTEGER NOT NULL DEFAULT 0,
    `speed` INTEGER NOT NULL DEFAULT 30,
    `maxHp` INTEGER NOT NULL DEFAULT 1,
    `currentHp` INTEGER NOT NULL DEFAULT 1,
    `temporaryHp` INTEGER NOT NULL DEFAULT 0,
    `hitDice` VARCHAR(191) NULL,
    `proficiencyBonus` INTEGER NOT NULL DEFAULT 2,
    `inspiration` BOOLEAN NOT NULL DEFAULT false,
    `personalityTraits` VARCHAR(191) NULL,
    `ideals` VARCHAR(191) NULL,
    `bonds` VARCHAR(191) NULL,
    `flaws` VARCHAR(191) NULL,
    `appearance` VARCHAR(191) NULL,
    `backstory` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Character_userId_idx`(`userId`),
    INDEX `Character_raceId_idx`(`raceId`),
    INDEX `Character_classId_idx`(`classId`),
    INDEX `Character_level_idx`(`level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Race` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `speed` INTEGER NOT NULL DEFAULT 30,
    `size` VARCHAR(191) NULL,
    `ageDescription` VARCHAR(191) NULL,

    UNIQUE INDEX `Race_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subrace` (
    `id` VARCHAR(191) NOT NULL,
    `raceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    INDEX `Subrace_raceId_idx`(`raceId`),
    UNIQUE INDEX `Subrace_raceId_name_key`(`raceId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RaceBonus` (
    `id` VARCHAR(191) NOT NULL,
    `raceId` VARCHAR(191) NOT NULL,
    `attribute` VARCHAR(191) NOT NULL,
    `bonusValue` INTEGER NOT NULL,

    INDEX `RaceBonus_raceId_idx`(`raceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Class` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `hitDice` INTEGER NOT NULL,
    `primaryAbility` VARCHAR(191) NULL,
    `savingThrows` VARCHAR(191) NULL,

    UNIQUE INDEX `Class_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassFeature` (
    `id` VARCHAR(191) NOT NULL,
    `classId` VARCHAR(191) NOT NULL,
    `level` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    INDEX `ClassFeature_classId_level_idx`(`classId`, `level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Background` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `feature` VARCHAR(191) NULL,

    UNIQUE INDEX `Background_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Skill` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `relatedAttribute` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Skill_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CharacterSkill` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `skillId` VARCHAR(191) NOT NULL,
    `proficient` BOOLEAN NOT NULL DEFAULT false,
    `expertise` BOOLEAN NOT NULL DEFAULT false,

    INDEX `CharacterSkill_skillId_idx`(`skillId`),
    UNIQUE INDEX `CharacterSkill_characterId_skillId_key`(`characterId`, `skillId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proficiency` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('weapon', 'armor', 'tool', 'language', 'savingThrow') NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Proficiency_type_name_key`(`type`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CharacterProficiency` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `proficiencyId` VARCHAR(191) NOT NULL,

    INDEX `CharacterProficiency_proficiencyId_idx`(`proficiencyId`),
    UNIQUE INDEX `CharacterProficiency_characterId_proficiencyId_key`(`characterId`, `proficiencyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `rarity` VARCHAR(191) NULL,
    `weight` DOUBLE NULL,
    `value` INTEGER NULL,
    `description` VARCHAR(191) NULL,
    `damage` VARCHAR(191) NULL,
    `armorClass` INTEGER NULL,
    `properties` VARCHAR(191) NULL,

    UNIQUE INDEX `Item_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CharacterItem` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `equipped` BOOLEAN NOT NULL DEFAULT false,

    INDEX `CharacterItem_itemId_idx`(`itemId`),
    UNIQUE INDEX `CharacterItem_characterId_itemId_key`(`characterId`, `itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Spell` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `level` INTEGER NOT NULL,
    `school` VARCHAR(191) NOT NULL,
    `castingTime` VARCHAR(191) NULL,
    `range` VARCHAR(191) NULL,
    `duration` VARCHAR(191) NULL,
    `components` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `damage` VARCHAR(191) NULL,
    `savingThrow` VARCHAR(191) NULL,

    UNIQUE INDEX `Spell_name_key`(`name`),
    INDEX `Spell_level_idx`(`level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CharacterSpell` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `spellId` VARCHAR(191) NOT NULL,
    `prepared` BOOLEAN NOT NULL DEFAULT false,

    INDEX `CharacterSpell_spellId_idx`(`spellId`),
    UNIQUE INDEX `CharacterSpell_characterId_spellId_key`(`characterId`, `spellId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feature` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `sourceType` VARCHAR(191) NOT NULL,
    `sourceId` VARCHAR(191) NOT NULL,

    INDEX `Feature_sourceType_sourceId_idx`(`sourceType`, `sourceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
