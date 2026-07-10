// kJ 转 kcal
export function kjToKcal(kj: number): number {
  return Math.round(kj / 4.184)
}

// 计算营养密度：每100kcal 含有的蛋白质克数
export function getNutrientDensity(proteinPer100g: number, energyKj: number): number {
  const energyKcal = kjToKcal(energyKj)
  if (energyKcal === 0) return 0
  return Math.round((proteinPer100g / energyKcal) * 100 * 10) / 10
}
