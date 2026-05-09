import { PrismaClient, ProficiencyType } from "@prisma/client"
import { readFile } from "fs/promises"
import path from "path"

const prisma = new PrismaClient()

type RaceSeed = {
  slug: string
  name: string
  description?: string
  speed?: number
  size?: string
  ageDescription?: string
  languages?: unknown
  features?: unknown
  bonuses?: Array<{ attribute: string; bonusValue: number }>
}

type SubraceSeed = {
  slug: string
  raceSlug: string
  name: string
  description?: string
  features?: unknown
}

type ClassSeed = {
  slug: string
  name: string
  description?: string
  hitDice: string
  primaryAbility?: string[]
  savingThrows?: string[]
  proficiencies?: unknown
  features?: string[]
}

type SkillSeed = {
  slug: string
  name: string
  description?: string
  relatedAttribute: string
}

type BackgroundSeed = {
  slug: string
  name: string
  description?: string
  feature?: string
  skillProficiencies?: unknown
  toolProficiencies?: unknown
  languagesGranted?: unknown
  equipmentGranted?: unknown
}

type ProficiencySeed = {
  slug: string
  type: ProficiencyType
  name: string
  description?: string
}

type ItemSeed = {
  slug: string
  name: string
  description?: string
  type: string
  category?: string
  rarity?: string
  weight?: number
  value?: number
  damage?: string
  damageType?: string
  armorClass?: number
  dexterityModifier?: string
  stealthDisadvantage?: boolean
  properties?: string
}

type SpellSeed = {
  slug: string
  name: string
  description?: string
  level: number
  school: string
  castingTime?: string
  range?: string
  duration?: string
  components?: string
  concentration?: boolean
  ritual?: boolean
  damage?: string
  damageType?: string
  savingThrow?: string | null
}

async function readSeedFile<T>(...segments: string[]): Promise<T> {
  const filePath = path.join(process.cwd(), "seed-data", ...segments)
  const content = await readFile(filePath, "utf-8")
  return JSON.parse(content) as T
}

function parseHitDice(value: string) {
  const n = Number(value.replace(/[^0-9]/g, ""))
  return Number.isFinite(n) && n > 0 ? n : 8
}

async function clearSeedTargets() {
  await prisma.characterSpell.deleteMany()
  await prisma.characterItem.deleteMany()
  await prisma.characterProficiency.deleteMany()
  await prisma.characterSkill.deleteMany()
  await prisma.classFeature.deleteMany()
  await prisma.raceBonus.deleteMany()
  await prisma.subrace.deleteMany()
  await prisma.spell.deleteMany()
  await prisma.item.deleteMany()
  await prisma.proficiency.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.background.deleteMany()
  await prisma.class.deleteMany()
  await prisma.race.deleteMany()
}

async function main() {
  const races = await readSeedFile<RaceSeed[]>("races", "races.json")
  const subraces = await readSeedFile<SubraceSeed[]>("subraces", "subraces.json")
  const classes = await readSeedFile<ClassSeed[]>("classes", "classes.json")
  const skills = await readSeedFile<SkillSeed[]>("skills", "skills.json")
  const backgrounds = await readSeedFile<BackgroundSeed[]>("backgrounds", "backgrounds.json")
  const proficiencies = await readSeedFile<ProficiencySeed[]>("proficiencies", "proficiencies.json")
  const items = await readSeedFile<ItemSeed[]>("items", "items.json")
  const spells = await readSeedFile<SpellSeed[]>("spells", "spells.json")

  await clearSeedTargets()

  for (const race of races) {
    const createdRace = await prisma.race.create({
      data: {
        slug: race.slug,
        name: race.name,
        description: race.description ?? null,
        speed: race.speed ?? 30,
        size: race.size ?? null,
        ageDescription: race.ageDescription ?? null,
        languages: race.languages ?? undefined,
        features: race.features ?? undefined,
      },
    })

    for (const bonus of race.bonuses ?? []) {
      await prisma.raceBonus.create({
        data: {
          raceId: createdRace.id,
          attribute: bonus.attribute,
          bonusValue: bonus.bonusValue,
        },
      })
    }
  }

  for (const subrace of subraces) {
    const race = await prisma.race.findUnique({ where: { slug: subrace.raceSlug }, select: { id: true } })
    if (!race) continue
    await prisma.subrace.create({
      data: {
        raceId: race.id,
        slug: subrace.slug,
        name: subrace.name,
        description: subrace.description ?? null,
        features: subrace.features ?? undefined,
      },
    })
  }

  for (const klass of classes) {
    const createdClass = await prisma.class.create({
      data: {
        slug: klass.slug,
        name: klass.name,
        description: klass.description ?? null,
        hitDice: parseHitDice(klass.hitDice),
        primaryAbility: (klass.primaryAbility ?? []).join(","),
        savingThrows: (klass.savingThrows ?? []).join(","),
        proficiencies: klass.proficiencies ?? undefined,
      },
    })

    for (const feature of klass.features ?? []) {
      await prisma.classFeature.create({
        data: {
          classId: createdClass.id,
          slug: feature,
          level: 1,
          name: feature,
          description: null,
        },
      })
    }
  }

  for (const skill of skills) {
    await prisma.skill.create({
      data: {
        slug: skill.slug,
        name: skill.name,
        description: skill.description ?? null,
        relatedAttribute: skill.relatedAttribute,
      },
    })
  }

  for (const background of backgrounds) {
    await prisma.background.create({
      data: {
        slug: background.slug,
        name: background.name,
        description: background.description ?? null,
        feature: background.feature ?? null,
        skillProficiencies: background.skillProficiencies ?? undefined,
        toolProficiencies: background.toolProficiencies ?? undefined,
        languagesGranted: background.languagesGranted ?? undefined,
        equipmentGranted: background.equipmentGranted ?? undefined,
      },
    })
  }

  for (const proficiency of proficiencies) {
    await prisma.proficiency.create({
      data: {
        slug: proficiency.slug,
        type: proficiency.type,
        name: proficiency.name,
        description: proficiency.description ?? null,
      },
    })
  }

  for (const item of items) {
    await prisma.item.create({
      data: {
        slug: item.slug,
        name: item.name,
        type: item.type,
        category: item.category ?? null,
        rarity: item.rarity ?? null,
        weight: item.weight ?? null,
        value: item.value ?? null,
        description: item.description ?? null,
        damage: item.damage ?? null,
        damageType: item.damageType ?? null,
        armorClass: item.armorClass ?? null,
        dexterityModifier: item.dexterityModifier ?? null,
        stealthDisadvantage: item.stealthDisadvantage ?? null,
        properties: item.properties ?? null,
      },
    })
  }

  for (const spell of spells) {
    await prisma.spell.create({
      data: {
        slug: spell.slug,
        name: spell.name,
        level: spell.level,
        school: spell.school,
        castingTime: spell.castingTime ?? null,
        range: spell.range ?? null,
        duration: spell.duration ?? null,
        components: spell.components ?? null,
        description: spell.description ?? null,
        damage: spell.damage ?? null,
        damageType: spell.damageType ?? null,
        concentration: spell.concentration ?? false,
        ritual: spell.ritual ?? false,
        savingThrow: spell.savingThrow ?? null,
      },
    })
  }

  await prisma.user.upsert({
    where: { username: "caua.moura" },
    update: {
      name: "Caua Moura",
      role: "mestre",
      email: null,
      avatarData: null,
      avatarMimeType: null,
    },
    create: {
      username: "caua.moura",
      name: "Caua Moura",
      role: "mestre",
      email: null,
      passwordHash: null,
      displayName: "Caua",
      avatarData: null,
      avatarMimeType: null,
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })

