import { calculateScore } from '@/engine/scoring'
import type { AnalysisResult, FoodAnalysis } from '@/types'

export function analyzeFood(analysis: FoodAnalysis): AnalysisResult {
  return calculateScore(analysis)
}

export * from '@/engine/scoring'
