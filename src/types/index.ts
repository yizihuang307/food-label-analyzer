export type ScoreLevel = 'green' | 'yellow' | 'red'
export type HealthLevel = 'recommended' | 'moderate' | 'caution'

export interface Nutrients {
  energy: number        // kJ/100g
  protein: number       // g/100g
  fat: number           // g/100g
  saturatedFat: number  // g/100g
  transFat: number      // g/100g
  carbohydrates: number // g/100g
  sugar: number         // g/100g
  sodium: number        // mg/100g
  fiber?: number        // g/100g
}

export interface FoodAnalysis {
  id: string
  foodName: string
  image?: string
  servingSize: number
  servingUnit: string
  nutrientsPer100g: Nutrients
  ingredients: string[]
  rawOcrText?: string
  createdAt: number
}

export interface DimensionScore {
  score: number
  maxScore: number
  label: string
  details: string[]
}

export interface Reason {
  type: 'positive' | 'negative'
  text: string
}

export interface IngredientInfo {
  name: string
  isAdditive: boolean
  riskLevel?: 'high' | 'medium' | 'low'
  category?: string
  scoreImpact?: number
  description?: string
  isUnknown?: boolean
}

export interface AnalysisResult {
  id: string
  foodName: string
  createdAt: number
  totalScore: number
  level: HealthLevel
  levelText: string
  suggestion: string
  dimensions: {
    ingredientCleanliness: DimensionScore
    nutritionQuality: DimensionScore
    processingLevel: DimensionScore
  }
  reasons: Reason[]
  ingredientBreakdown: IngredientInfo[]
}

export interface AppState {
  currentAnalysis: FoodAnalysis | null
  currentImage: string | null
  currentResult: AnalysisResult | null
  history: AnalysisResult[]
}
