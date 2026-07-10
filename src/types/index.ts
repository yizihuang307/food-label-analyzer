export type ScoreLevel = 'green' | 'yellow' | 'red'

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

export interface Warning {
  type: 'ingredient' | 'nutrition'
  level: ScoreLevel
  title: string
  description: string
}

export interface IngredientInfo {
  name: string
  isAdditive: boolean
  riskLevel?: ScoreLevel
  category?: string
  description?: string
}

export interface NutrientHighlight {
  name: string
  value: number
  unit: string
  level: ScoreLevel
  description: string
}

export interface AnalysisResult {
  id: string
  foodName: string
  createdAt: number
  ingredientScore: ScoreLevel
  nutritionScore: ScoreLevel
  overallSuggestion: string
  warnings: Warning[]
  ingredientBreakdown: IngredientInfo[]
  nutrientHighlights: NutrientHighlight[]
}

export interface AppState {
  currentAnalysis: FoodAnalysis | null
  currentImage: string | null
  currentResult: AnalysisResult | null
  history: AnalysisResult[]
}
