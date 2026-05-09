export function abilityModifier(score: number): number {
  if (!Number.isFinite(score)) return 0
  return Math.floor((score - 10) / 2)
}

export type AbilityScores = {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export type AbilityModifiers = {
  strengthModifier: number
  dexterityModifier: number
  constitutionModifier: number
  intelligenceModifier: number
  wisdomModifier: number
  charismaModifier: number
}

export function abilityModifiers(scores: AbilityScores): AbilityModifiers {
  return {
    strengthModifier: abilityModifier(scores.strength),
    dexterityModifier: abilityModifier(scores.dexterity),
    constitutionModifier: abilityModifier(scores.constitution),
    intelligenceModifier: abilityModifier(scores.intelligence),
    wisdomModifier: abilityModifier(scores.wisdom),
    charismaModifier: abilityModifier(scores.charisma),
  }
}

