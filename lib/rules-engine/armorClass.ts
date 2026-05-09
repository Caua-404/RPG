export type ArmorType = "light" | "medium" | "heavy" | "shield" | "none"

export type EquippedArmor = {
  type: ArmorType
  baseArmorClass?: number // ex: couro 11, cota de malha 16, etc.
  maxDexBonus?: number | null // médio costuma limitar em +2; pesado ignora destreza
}

export type ArmorClassInput = {
  dexterityModifier: number
  equipped: EquippedArmor[]
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function armorClass(input: ArmorClassInput): number {
  const dexMod = Math.floor(input.dexterityModifier || 0)
  const equipped = input.equipped ?? []

  const shieldBonus = equipped.some((e) => e.type === "shield") ? 2 : 0
  const armor = equipped.find((e) => e.type === "heavy" || e.type === "medium" || e.type === "light")

  // Sem armadura: 10 + DEX (+ escudo)
  if (!armor || armor.type === "none") return 10 + dexMod + shieldBonus

  const base = Math.max(1, Math.floor(armor.baseArmorClass ?? 10))

  if (armor.type === "heavy") {
    return base + shieldBonus
  }

  if (armor.type === "medium") {
    const maxDex = armor.maxDexBonus ?? 2
    const dex = clamp(dexMod, -5, maxDex)
    return base + dex + shieldBonus
  }

  // light
  return base + dexMod + shieldBonus
}

