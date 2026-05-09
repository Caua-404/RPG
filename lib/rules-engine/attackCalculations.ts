export type AttackInput = {
  abilityModifier: number
  proficiencyBonus?: number
  proficient?: boolean
  magicBonus?: number
}

export type AttackOutput = {
  attackBonus: number
}

export function attackBonus(input: AttackInput): AttackOutput {
  const ability = Math.floor(input.abilityModifier || 0)
  const prof = Math.floor(input.proficiencyBonus || 0)
  const isProf = input.proficient ?? false
  const magic = Math.floor(input.magicBonus || 0)
  return { attackBonus: ability + (isProf ? prof : 0) + magic }
}

