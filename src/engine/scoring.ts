import { findAdditive } from '@/data/additives'
import { kjToKcal } from '@/data/nutritionRules'
import { isCommonIngredient } from '@/data/commonIngredients'
import { countProcessingKeywords } from '@/data/processingKeywords'
import type { AnalysisResult, DimensionScore, FoodAnalysis, IngredientInfo, Reason } from '@/types'

// ===== 配料干净度评分（40 分）=====

function scoreIngredientCount(count: number): { score: number; detail: string } {
  if (count <= 5) {
    return { score: 10, detail: `配料仅 ${count} 种，简单干净` }
  }
  if (count <= 10) {
    return { score: 7, detail: `配料 ${count} 种，属于正常范围` }
  }
  return { score: 4, detail: `配料 ${count} 种，较为复杂` }
}

function scoreAdditives(ingredients: string[]): { score: number; details: string[]; breakdown: IngredientInfo[] } {
  let score = 20
  const details: string[] = []
  const breakdown: IngredientInfo[] = []

  for (const ingredient of ingredients) {
    const additive = findAdditive(ingredient)
    if (additive) {
      score += additive.scoreImpact
      breakdown.push({
        name: ingredient,
        isAdditive: true,
        riskLevel: additive.riskLevel,
        category: additive.category,
        scoreImpact: additive.scoreImpact,
        description: additive.description,
      })
      if (score < 0) score = 0
    } else {
      breakdown.push({
        name: ingredient,
        isAdditive: false,
      })
    }
  }

  const found = breakdown.filter((i) => i.isAdditive)
  if (found.length === 0) {
    details.push('未发现常见食品添加剂')
  } else {
    const high = found.filter((i) => i.riskLevel === 'high').length
    const medium = found.filter((i) => i.riskLevel === 'medium').length
    const low = found.filter((i) => i.riskLevel === 'low').length
    const parts: string[] = []
    if (high) parts.push(`${high} 个高风险`)
    if (medium) parts.push(`${medium} 个中风险`)
    if (low) parts.push(`${low} 个低风险`)
    details.push(`发现 ${found.length} 个添加剂（${parts.join('，')}）`)
  }

  return { score: Math.max(score, 0), details, breakdown }
}

function scoreUnknownIngredients(ingredients: string[]): { score: number; detail: string; unknownCount: number } {
  const unknown = ingredients.filter((name) => {
    const additive = findAdditive(name)
    if (additive) return false
    return !isCommonIngredient(name)
  })

  if (unknown.length === 0) {
    return { score: 10, detail: '配料都是常见食材', unknownCount: 0 }
  }
  if (unknown.length <= 3) {
    return { score: 10, detail: `有 ${unknown.length} 个不太常见的配料，需要留意`, unknownCount: unknown.length }
  }
  return { score: 5, detail: `有 ${unknown.length} 个陌生配料，建议谨慎选择`, unknownCount: unknown.length }
}

// ===== 营养质量评分（50 分）=====

function scoreSodium(mg: number): { score: number; detail: string } {
  if (mg < 400) return { score: 15, detail: `钠含量 ${mg}mg/100g，较低` }
  if (mg < 800) return { score: 10, detail: `钠含量 ${mg}mg/100g，偏高` }
  if (mg < 1200) return { score: 5, detail: `钠含量 ${mg}mg/100g，较高` }
  return { score: 0, detail: `钠含量 ${mg}mg/100g，很高` }
}

function scoreSugar(g: number): { score: number; detail: string } {
  if (g < 5) return { score: 15, detail: `糖含量 ${g}g/100g，较低` }
  if (g < 15) return { score: 10, detail: `糖含量 ${g}g/100g，偏高` }
  if (g < 25) return { score: 5, detail: `糖含量 ${g}g/100g，较高` }
  return { score: 0, detail: `糖含量 ${g}g/100g，很高` }
}

function scoreFatQuality(saturatedFat: number, transFat: number): { score: number; details: string[] } {
  let score = 10
  const details: string[] = []
  if (transFat > 0.5) {
    score -= 5
    details.push(`反式脂肪 ${transFat}g/100g，扣 5 分`)
  } else if (transFat > 0) {
    details.push(`反式脂肪 ${transFat}g/100g，较低`)
  } else {
    details.push('未检出反式脂肪')
  }
  if (saturatedFat >= 5) {
    score -= 3
    details.push(`饱和脂肪 ${saturatedFat}g/100g，扣 3 分`)
  } else if (saturatedFat > 0) {
    details.push(`饱和脂肪 ${saturatedFat}g/100g，适中`)
  }
  return { score: Math.max(score, 0), details }
}

function scoreEnergyDensity(energyKj: number): { score: number; detail: string } {
  const kcal = kjToKcal(energyKj)
  if (kcal < 150) return { score: 10, detail: `能量密度 ${kcal}kcal/100g，较低` }
  if (kcal <= 400) return { score: 5, detail: `能量密度 ${kcal}kcal/100g，适中` }
  return { score: 0, detail: `能量密度 ${kcal}kcal/100g，较高` }
}

// ===== 加工程度评分（10 分）=====

function scoreProcessingLevel(ingredients: string[]): { score: number; detail: string } {
  const count = countProcessingKeywords(ingredients)
  if (count <= 1) return { score: 10, detail: `含 ${count} 个超加工关键词，加工程度低` }
  if (count <= 4) return { score: 5, detail: `含 ${count} 个超加工关键词，加工程度中等` }
  return { score: 2, detail: `含 ${count} 个超加工关键词，加工程度较高` }
}

// ===== 主评分函数 =====

export function calculateScore(analysis: FoodAnalysis): AnalysisResult {
  const { foodName, ingredients, nutrientsPer100g } = analysis
  const reasons: Reason[] = []

  // 1. 配料干净度
  const countScore = scoreIngredientCount(ingredients.length)
  const additiveResult = scoreAdditives(ingredients)
  const unknownResult = scoreUnknownIngredients(ingredients)
  const ingredientCleanlinessScore = countScore.score + additiveResult.score + unknownResult.score
  const ingredientCleanliness: DimensionScore = {
    score: ingredientCleanlinessScore,
    maxScore: 40,
    label: '配料干净度',
    details: [countScore.detail, ...additiveResult.details, unknownResult.detail],
  }

  // 2. 营养质量
  const sodium = scoreSodium(nutrientsPer100g.sodium)
  const sugar = scoreSugar(nutrientsPer100g.sugar)
  const fat = scoreFatQuality(nutrientsPer100g.saturatedFat, nutrientsPer100g.transFat)
  const energy = scoreEnergyDensity(nutrientsPer100g.energy)
  const nutritionQualityScore = sodium.score + sugar.score + fat.score + energy.score
  const nutritionQuality: DimensionScore = {
    score: nutritionQualityScore,
    maxScore: 50,
    label: '营养质量',
    details: [sodium.detail, sugar.detail, ...fat.details, energy.detail],
  }

  // 3. 加工程度
  const processing = scoreProcessingLevel(ingredients)
  const processingLevel: DimensionScore = {
    score: processing.score,
    maxScore: 10,
    label: '加工程度',
    details: [processing.detail],
  }

  // 总分
  const totalScore = Math.round(
    ingredientCleanlinessScore * 0.4 +
    nutritionQualityScore * 0.5 +
    processing.score * 0.1
  )

  // 收集原因
  if (countScore.score >= 10) reasons.push({ type: 'positive', text: '配料简单干净' })
  if (additiveResult.score === 20) reasons.push({ type: 'positive', text: '未检出常见添加剂' })
  if (unknownResult.score < 10) reasons.push({ type: 'negative', text: unknownResult.detail })
  if (sodium.score < 15) reasons.push({ type: 'negative', text: sodium.detail })
  if (sugar.score < 15) reasons.push({ type: 'negative', text: sugar.detail })
  if (fat.score < 10) reasons.push({ type: 'negative', text: '脂肪质量欠佳' })
  if (energy.score < 10) reasons.push({ type: 'negative', text: energy.detail })
  if (processing.score < 10) reasons.push({ type: 'negative', text: processing.detail })

  // 健康等级
  let level: AnalysisResult['level']
  let levelText: string
  let suggestion: string

  if (totalScore >= 85) {
    level = 'recommended'
    levelText = '推荐'
    suggestion = '配料简单，营养结构较好，可以放心选择'
  } else if (totalScore >= 60) {
    level = 'moderate'
    levelText = '适量'
    suggestion = '整体可以，但需要注意摄入频率和份量'
  } else {
    level = 'caution'
    levelText = '注意'
    suggestion = '存在较明显营养风险，建议减少摄入'
  }

  return {
    id: analysis.id,
    foodName,
    createdAt: analysis.createdAt,
    totalScore,
    level,
    levelText,
    suggestion,
    dimensions: {
      ingredientCleanliness,
      nutritionQuality,
      processingLevel,
    },
    reasons,
    ingredientBreakdown: additiveResult.breakdown,
  }
}
