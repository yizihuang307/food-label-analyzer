import { Button } from '@/components/Button'
import { analyzeFood } from '@/engine/analyzer'
import { useAnalysisStore } from '@/stores/analysisStore'
import type { FoodAnalysis, Nutrients } from '@/types'
import { ArrowRight, Calculator } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const nutrientFields: { key: keyof Nutrients; label: string; unit: string; step: string }[] = [
  { key: 'energy', label: '能量', unit: 'kJ/100g', step: '1' },
  { key: 'protein', label: '蛋白质', unit: 'g/100g', step: '0.1' },
  { key: 'fat', label: '脂肪', unit: 'g/100g', step: '0.1' },
  { key: 'saturatedFat', label: '饱和脂肪', unit: 'g/100g', step: '0.1' },
  { key: 'transFat', label: '反式脂肪', unit: 'g/100g', step: '0.1' },
  { key: 'carbohydrates', label: '碳水化合物', unit: 'g/100g', step: '0.1' },
  { key: 'sugar', label: '糖', unit: 'g/100g', step: '0.1' },
  { key: 'sodium', label: '钠', unit: 'mg/100g', step: '1' },
  { key: 'fiber', label: '膳食纤维', unit: 'g/100g', step: '0.1' },
]

export function ReviewPage() {
  const navigate = useNavigate()
  const currentAnalysis = useAnalysisStore((s) => s.currentAnalysis)
  const currentImage = useAnalysisStore((s) => s.currentImage)
  const setCurrentResult = useAnalysisStore((s) => s.setCurrentResult)
  const saveResult = useAnalysisStore((s) => s.saveResult)

  const [foodName, setFoodName] = useState(currentAnalysis?.foodName || '')
  const [nutrients, setNutrients] = useState<Nutrients>(
    currentAnalysis?.nutrientsPer100g || {
      energy: 0, protein: 0, fat: 0, saturatedFat: 0, transFat: 0,
      carbohydrates: 0, sugar: 0, sodium: 0, fiber: 0,
    }
  )
  const [ingredientText, setIngredientText] = useState(
    currentAnalysis?.ingredients.join('，') || ''
  )
  const [servingSize, setServingSize] = useState(currentAnalysis?.servingSize || 1)
  const [servingUnit, setServingUnit] = useState(currentAnalysis?.servingUnit || '份')

  const handleNutrientChange = (key: keyof Nutrients, value: string) => {
    const num = value === '' ? 0 : Number.parseFloat(value)
    setNutrients((prev) => ({ ...prev, [key]: Number.isNaN(num) ? 0 : num }))
  }

  const handleAnalyze = () => {
    const ingredients = ingredientText
      .split(/[,，、]\s*/)
      .map((i) => i.trim())
      .filter(Boolean)

    const analysis: FoodAnalysis = {
      id: currentAnalysis?.id || crypto.randomUUID(),
      foodName: foodName.trim() || '未命名食品',
      image: currentImage || undefined,
      servingSize,
      servingUnit,
      nutrientsPer100g: nutrients,
      ingredients,
      createdAt: Date.now(),
    }

    const result = analyzeFood(analysis)
    setCurrentResult(result)
    saveResult(result)
    navigate('/result')
  }

  return (
    <div className="min-h-svh flex flex-col">
      <header className="safe-top px-5 pt-6 pb-4">
        <button
          onClick={() => navigate('/scan')}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← 重新拍照
        </button>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">校对识别结果</h1>
        <p className="mt-1 text-sm text-slate-500">请核对并补充信息，确保分析准确</p>
      </header>

      <main className="flex-1 px-5 pb-8">
        {currentImage && (
          <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
            <img
              src={currentImage}
              alt="食品标签"
              className="h-40 w-full object-contain"
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">食品名称</label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="如：某品牌全麦面包"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-900">营养成分（每 100g）</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {nutrientFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-slate-600">
                    {field.label}
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      step={field.step}
                      value={nutrients[field.key] || ''}
                      onChange={(e) => handleNutrientChange(field.key, e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="0"
                    />
                    <span className="absolute right-2 top-2 text-xs text-slate-400">
                      {field.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">配料表</label>
            <p className="text-xs text-slate-500">用逗号、顿号或换行分隔每种配料</p>
            <textarea
              value={ingredientText}
              onChange={(e) => setIngredientText(e.target.value)}
              placeholder="如：小麦粉，水，白砂糖，酵母..."
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-900">单次食用份量</h3>
            <div className="mt-3 flex gap-3">
              <input
                type="number"
                value={servingSize}
                onChange={(e) => setServingSize(Number.parseFloat(e.target.value) || 1)}
                className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                placeholder="份、片、包"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <Button onClick={handleAnalyze} className="w-full">
            <Calculator className="mr-2 h-5 w-5" />
            开始分析
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  )
}
