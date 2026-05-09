export type SpellSaveDcInput = {
  spellcastingAbilityModifier: number
  proficiencyBonus: number
  miscBonus?: number
}

export function spellSaveDc(input: SpellSaveDcInput): number {
  const ability = Math.floor(input.spellcastingAbilityModifier || 0)
  const prof = Math.floor(input.proficiencyBonus || 0)
  const misc = Math.floor(input.miscBonus || 0)
  return 8 + ability + prof + misc
}

export type SpellAttackBonusInput = {
  spellcastingAbilityModifier: number
  proficiencyBonus: number
  miscBonus?: number
}

export function spellAttackBonus(input: SpellAttackBonusInput): number {
  const ability = Math.floor(input.spellcastingAbilityModifier || 0)
  const prof = Math.floor(input.proficiencyBonus || 0)
  const misc = Math.floor(input.miscBonus || 0)
  return ability + prof + misc
}

