import { Button } from '@/components/Button'
import { ScoreBadge } from '@/components/ScoreBadge'
import { WarningCard } from '@/components/WarningCard'
import { useAnalysisStore } from '@/stores/analysisStore'
import { ChevronRight, RotateCcw, Save } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

export function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentResult = useAnalysisStore((s) => s.currentResult)

  const result = (location.state as { result?: typeof currentResult })?.result || currentResult

  if (!result) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center px-5">
        <p className="text-slate-500">没有分析结果</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          返回首页
        </Button>
      </div>
    )
  }

  const ingredientLabels: Record<string, string> = {
    green: '配料干净',
    yellow: '配料一般',
    red: '配料复杂',
  }

  const nutritionLabels: Record<string, string> = {
    green: '可常吃',
    yellow: '适量吃',
    red: '少吃',
  }

  return (
    <div className="min-h-svh flex flex-col">
      <header className="safe-top px-5 pt-6 pb-4">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← 返回首页
        </button>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{result.foodName}</h1>
      </header>

      <main className="flex-1 px-5 pb-8">
        {/* 综合建议 */}
        <div className="rounded-2xl bg-emerald-600 p-5 text-white shadow-lg">
          <p className="text-sm text-emerald-100">综合建议</p>
          <p className="mt-2 text-lg font-semibold leading-relaxed">
            {result.overallSuggestion}
          </p>
        </div>

        {/* 双维度评分 */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-xs text-slate-500">配料干净度</p>
            <div className="mt-2 flex justify-center">
              <ScoreBadge score={result.ingredientScore} label={ingredientLabels[result.ingredientScore]} />
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-xs text-slate-500">营养健康度</p>
            <div className="mt-2 flex justify-center">
              <ScoreBadge score={result.nutritionScore} label={nutritionLabels[result.nutritionScore]} />
            </div>
          </div>
        </div>

        {/* 需关注项 */}
        {result.warnings.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900">需关注项</h2>
            <div className="mt-3 space-y-3">
              {result.warnings.map((warning, idx) => (
                <WarningCard key={idx} warning={warning} />
              ))}
            </div>
          </div>
        )}

        {/* 营养素亮点 */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900">营养分析</h2>
          <div className="mt-3 space-y-2">
            {result.nutrientHighlights.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-slate-900">
                    {item.value}
                    {item.unit}
                  </span>
                  <span
                    className={`ml-2 inline-block h-2.5 w-2.5 rounded-full ${
                      item.level === 'green'
                        ? 'bg-emerald-500'
                        : item.level === 'yellow'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 配料解析 */}
        {result.ingredientBreakdown.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900">配料解析</h2>
            <div className="mt-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-wrap gap-2">
                {result.ingredientBreakdown.map((item) => (
                  <span
                    key={item.name}
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm ${
                      item.isAdditive
                        ? item.riskLevel === 'red'
                          ? 'bg-red-100 text-red-700'
                          : item.riskLevel === 'yellow'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                    title={item.description || item.name}
                  >
                    {item.name}
                    {item.isAdditive && (
                      <span className="ml-1 text-xs opacity-75">({item.category})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-8 grid gap-3">
          <Button onClick={() => navigate('/scan')} variant="outline" className="w-full">
            <RotateCcw className="mr-2 h-5 w-5" />
            分析另一个食品
          </Button>
          <Button onClick={() => navigate('/history')} variant="secondary" className="w-full">
            <Save className="mr-2 h-5 w-5" />
            查看历史记录
            <ChevronRight className="ml-auto h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  )
}
