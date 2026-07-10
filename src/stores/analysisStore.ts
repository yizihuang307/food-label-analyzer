import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AnalysisResult, AppState, FoodAnalysis } from '@/types'

interface AnalysisStore extends AppState {
  setCurrentAnalysis: (analysis: FoodAnalysis | null) => void
  setCurrentImage: (image: string | null) => void
  setCurrentResult: (result: AnalysisResult | null) => void
  saveResult: (result: AnalysisResult) => void
  deleteResult: (id: string) => void
  clearHistory: () => void
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      currentAnalysis: null,
      currentImage: null,
      currentResult: null,
      history: [],

      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
      setCurrentImage: (image) => set({ currentImage: image }),
      setCurrentResult: (result) => set({ currentResult: result }),

      saveResult: (result) =>
        set((state) => ({
          history: [result, ...state.history.filter((r) => r.id !== result.id)],
        })),

      deleteResult: (id) =>
        set((state) => ({
          history: state.history.filter((r) => r.id !== id),
        })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'food-label-analyzer-v2',
      partialize: (state) => ({ history: state.history }),
    }
  )
)
