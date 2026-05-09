export type HitPointsInput = {
  level: number
  hitDie: number // ex: 8, 10, 12
  constitutionModifier: number
  // Em 5e, no nível 1 é máximo do dado; nos demais pode ser média/arredondamentos ou rolagem.
  // Aqui implementamos um padrão determinístico: média arredondada para cima (ex: d8 => 5).
  useAverageAfterLevel1?: boolean
}

function averageHitDie(hitDie: number): number {
  if (!Number.isFinite(hitDie) || hitDie <= 0) return 1
  // média "padrão" de 5e: arredonda para cima ((d/2)+1)
  return Math.floor(hitDie / 2) + 1
}

export function maxHitPoints(input: HitPointsInput): number {
  const level = Math.max(1, Math.floor(input.level || 1))
  const hitDie = Math.max(1, Math.floor(input.hitDie || 1))
  const con = Math.floor(input.constitutionModifier || 0)
  const useAvg = input.useAverageAfterLevel1 ?? true

  const level1 = hitDie + con
  if (level === 1) return Math.max(1, level1)

  const perLevel = (useAvg ? averageHitDie(hitDie) : hitDie) + con
  const total = level1 + (level - 1) * perLevel
  return Math.max(1, total)
}

