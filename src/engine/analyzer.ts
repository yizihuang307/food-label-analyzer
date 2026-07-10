import { findAdditive, getHighestRiskLevel } from '@/data/additives'
import { getNutritionDescription, getNutritionLevel, getNutrientDensity, kjToKcal } from '@/data/nutritionRules'
import type { AnalysisResult, FoodAnalysis, IngredientInfo, NutrientHighlight, ScoreLevel, Warning } from '@/types'

export function analyzeFood(analysis: FoodAnalysis): AnalysisResult {
  const { foodName, nutrientsPer100g, ingredients } = analysis

  const ingredientResult = analyzeIngredients(ingredients)
  const nutritionResult = analyzeNutrition(nutrientsPer100g)

  const overallSuggestion = generateOverallSuggestion(
    ingredientResult.score,
    nutritionResult.score,
    nutritionResult.highlights
  )

  return {
    id: analysis.id,
    foodName,
    createdAt: analysis.createdAt,
    ingredientScore: ingredientResult.score,
    nutritionScore: nutritionResult.score,
    overallSuggestion,
    warnings: [...ingredientResult.warnings, ...nutritionResult.warnings],
    ingredientBreakdown: ingredientResult.breakdown,
    nutrientHighlights: nutritionResult.highlights,
  }
}

interface IngredientAnalysis {
  score: ScoreLevel
  warnings: Warning[]
  breakdown: IngredientInfo[]
}

function analyzeIngredients(ingredients: string[]): IngredientAnalysis {
  if (!ingredients.length) {
    return {
      score: 'green',
      warnings: [],
      breakdown: [],
    }
  }

  const breakdown: IngredientInfo[] = []
  const riskLevels: ScoreLevel[] = []
  let additiveCount = 0

  for (const ingredient of ingredients) {
    const additive = findAdditive(ingredient)
    if (additive) {
      additiveCount++
      breakdown.push({
        name: ingredient,
        isAdditive: true,
        riskLevel: additive.riskLevel,
        category: additive.category,
        description: additive.description,
      })
      riskLevels.push(additive.riskLevel)
    } else {
      breakdown.push({
        name: ingredient,
        isAdditive: false,
      })
    }
  }

  // 配料数量判断
  let score: ScoreLevel = 'green'
  if (ingredients.length > 10) {
    score = 'red'
  } else if (ingredients.length > 5) {
    score = 'yellow'
  }

  // 如果存在高风险添加剂，整体配料干净度降一级
  if (riskLevels.includes('red')) {
    score = 'red'
  } else if (riskLevels.includes('yellow') && score === 'green') {
    score = 'yellow'
  }

  const warnings: Warning[] = []
  if (ingredients.length > 10) {
    warnings.push({
      type: 'ingredient',
      level: 'yellow',
      title: '配料较复杂',
      description: `配料表有 ${ingredients.length} 种成分，建议选择配料更简单的产品`,
    })
  }
  if (additiveCount > 0) {
    const redAdditives = breakdown.filter((b) => b.riskLevel === 'red').length
    if (redAdditives > 0) {
      warnings.push({
        type: 'ingredient',
        level: 'red',
        title: '含高风险添加剂',
        description: `发现 ${redAdditives} 个高风险成分，建议留意`,
      })
    } else {
      warnings.push({
        type: 'ingredient',
        level: 'yellow',
        title: '含食品添加剂',
        description: `发现 ${additiveCount} 个添加剂，建议适量食用`,
      })
    }
  }

  return { score, warnings, breakdown }
}

interface NutritionAnalysis {
  score: ScoreLevel
  warnings: Warning[]
  highlights: NutrientHighlight[]
}

function analyzeNutrition(nutrients: FoodAnalysis['nutrientsPer100g']): NutritionAnalysis {
  const warnings: Warning[] = []
  const highlights: NutrientHighlight[] = []
  const riskLevels: ScoreLevel[] = []

  const checkNutrient = (key: 'sodium' | 'sugar' | 'saturatedFat' | 'transFat' | 'energy' | 'carbohydrates' | 'protein') => {
    const value = nutrients[key]
    if (value === undefined) return

    const level = getNutritionLevel(key, value)
    riskLevels.push(level)

    highlights.push({
      name: getNutritionName(key),
      value,
      unit: getNutritionUnit(key),
      level,
      description: getNutritionDescription(key, value),
    })

    if (level === 'red') {
      warnings.push({
        type: 'nutrition',
        level: 'red',
        title: getNutritionWarningTitle(key),
        description: getNutritionDescription(key, value),
      })
    }
  }

  checkNutrient('sodium')
  checkNutrient('sugar')
  checkNutrient('saturatedFat')
  checkNutrient('transFat')
  checkNutrient('energy')
  checkNutrient('carbohydrates')
  checkNutrient('protein')

  // 营养密度
  if (nutrients.protein !== undefined && nutrients.energy !== undefined) {
    const density = getNutrientDensity(nutrients.protein, nutrients.energy)
    highlights.push({
      name: '营养密度',
      value: density,
      unit: 'g/100kcal',
      level: density >= 5 ? 'green' : density >= 2 ? 'yellow' : 'red',
      description: `每100kcal含蛋白质${density}g，${density >= 5 ? '营养密度较高' : density >= 2 ? '营养密度一般' : '营养密度较低'}`,
    })
  }

  const score = getHighestRiskLevel(riskLevels)

  return { score, warnings, highlights }
}

function getNutritionName(key: string): string {
  const names: Record<string, string> = {
    sodium: '钠',
    sugar: '糖',
    saturatedFat: '饱和脂肪',
    transFat: '反式脂肪',
    energy: '能量',
    carbohydrates: '碳水化合物',
    protein: '蛋白质',
  }
  return names[key] || key
}

function getNutritionUnit(key: string): string {
  return key === 'energy' ? 'kJ' : key === 'sodium' ? 'mg' : 'g'
}

function getNutritionWarningTitle(key: string): string {
  const titles: Record<string, string> = {
    sodium: '钠含量偏高',
    sugar: '含糖量偏高',
    saturatedFat: '饱和脂肪偏高',
    transFat: '含反式脂肪',
    energy: '能量密度较高',
    carbohydrates: '碳水化合物偏高',
    protein: '蛋白质含量较低',
  }
  return titles[key] || key
}

function generateOverallSuggestion(
  ingredientScore: ScoreLevel,
  nutritionScore: ScoreLevel,
  highlights: NutrientHighlight[]
): string {
  const mainIssue = highlights.find((h) => h.level === 'red')

  if (ingredientScore === 'green' && nutritionScore === 'green') {
    return '配料干净，营养也不错，可以适量食用'
  }
  if (ingredientScore === 'green' && nutritionScore === 'yellow') {
    return '配料比较干净，但营养方面有要注意的地方，控制份量即可'
  }
  if (ingredientScore === 'green' && nutritionScore === 'red') {
    const issue = mainIssue ? `，主要问题是${mainIssue.name}` : ''
    return `配料表比较简单${issue}，但本身营养风险较高，建议少吃并控制份量`
  }
  if (ingredientScore === 'yellow' && nutritionScore === 'green') {
    return '营养方面还可以，但配料中含一些添加剂，建议优先选择配料更简单的'
  }
  if (ingredientScore === 'red' && nutritionScore === 'red') {
    return '添加剂较多、营养风险也高，建议尽量少吃或换一款'
  }
  if (ingredientScore === 'red') {
    return '配料较复杂或含较多添加剂，建议留意成分并适量食用'
  }
  return '整体一般，可以偶尔吃，注意控制份量'
}

// 对外导出工具函数
export { kjToKcal }
