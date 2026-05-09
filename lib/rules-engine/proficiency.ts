export function proficiencyBonus(level: number): number {
  if (!Number.isFinite(level) || level <= 0) return 2
  if (level >= 17) return 6
  if (level >= 13) return 5
  if (level >= 9) return 4
  if (level >= 5) return 3
  return 2
}

