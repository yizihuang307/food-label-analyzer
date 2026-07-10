import type { ScoreLevel } from '@/types'

// 基于《中国居民膳食指南 2022》普通成年人参考值（2000 kcal 标准）
// 注意：营养成分表中的能量通常以 kJ 标注，这里统一使用 kJ
export const NUTRITION_RULES = {
  sodium: { threshold: 600, unit: 'mg', name: '钠', dailyMax: 2000 },
  sugar: { threshold: 15, unit: 'g', name: '糖', dailyMax: 50 },
  saturatedFat: { threshold: 5, unit: 'g', name: '饱和脂肪', dailyMax: 20 },
  transFat: { threshold: 0, unit: 'g', name: '反式脂肪', dailyMax: 0 },
  energy: { threshold: 1673, unit: 'kJ', name: '能量', dailyMax: 8368 }, // 400 kcal / 2000 kcal
  carbohydrates: { threshold: 60, unit: 'g', name: '碳水化合物', dailyMax: 300 },
  protein: { threshold: 20, unit: 'g', name: '蛋白质', dailyMax: 60 },
}

export interface NutritionRule {
  threshold: number
  unit: string
  name: string
  dailyMax: number
}

export function getNutritionLevel(
  key: keyof typeof NUTRITION_RULES,
  valuePer100g: number
): ScoreLevel {
  const rule = NUTRITION_RULES[key]
  if (!rule) return 'green'

  if (key === 'transFat') {
    return valuePer100g > 0 ? 'red' : 'green'
  }

  if (key === 'protein') {
    // 蛋白质是正面指标，越高越好
    return valuePer100g >= rule.threshold ? 'green' : 'yellow'
  }

  if (valuePer100g >= rule.threshold) return 'red'
  if (valuePer100g >= rule.threshold * 0.6) return 'yellow'
  return 'green'
}

export function getNutritionDescription(
  key: keyof typeof NUTRITION_RULES,
  valuePer100g: number
): string {
  const rule = NUTRITION_RULES[key]
  const level = getNutritionLevel(key, valuePer100g)

  if (key === 'transFat') {
    return level === 'red' ? '含有反式脂肪，建议尽量避免' : '未检出反式脂肪'
  }

  if (key === 'protein') {
    if (valuePer100g >= rule.threshold) return '蛋白质含量较高，是加分项'
    return '蛋白质含量一般'
  }

  const ratio = Math.round((valuePer100g / rule.dailyMax) * 100)
  if (level === 'red') return `每100g含${rule.name}${valuePer100g}${rule.unit}，约占每日推荐量${ratio}%`
  if (level === 'yellow') return `每100g含${rule.name}${valuePer100g}${rule.unit}，接近警戒线`
  return `每100g含${rule.name}${valuePer100g}${rule.unit}，含量适中`
}

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
