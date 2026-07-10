import { Button } from '@/components/Button'
import { useAnalysisStore } from '@/stores/analysisStore'
import type { AnalysisResult, DimensionScore, HealthLevel } from '@/types'
import { ChevronRight, RotateCcw, Save } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

function LevelBadge({ level, text }: { level: HealthLevel; text: string }) {
  const styles: Record<HealthLevel, string> = {
    recommended: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    moderate: 'bg-amber-100 text-amber-800 border-amber-200',
    caution: 'bg-red-100 text-red-800 border-red-200',
  }

  const dots: Record<HealthLevel, string> = {
    recommended: 'bg-emerald-500',
    moderate: 'bg-amber-500',
    caution: 'bg-red-500',
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${styles[level]}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${dots[level]}`} />
      {text}
    </span>
  )
}

function ScoreRing({ score, maxScore, label, colorClass }: { score: number; maxScore: number; label: string; colorClass: string }) {
  const percentage = Math.round((score / maxScore) * 100)
  return (
    <div className="flex flex-col items-center">
      <div className={`relative flex h-20 w-20 items-center justify-center rounded-full ${colorClass} bg-opacity-10`}>
        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate-200"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className={colorClass.replace('bg-', 'text-').replace('bg-opacity-10', '')}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
          />
        </svg>
        <span className="absolute text-lg font-bold text-slate-800">{score}</span>
      </div>
      <span className="mt-2 text-xs font-medium text-slate-600">{label}</span>
      <span className="text-xs text-slate-400">{maxScore} 分</span>
    </div>
  )
}

function DimensionCard({ dimension }: { dimension: DimensionScore }) {
  const percentage = Math.round((dimension.score / dimension.maxScore) * 100)
  const barColor = percentage >= 80 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{dimension.label}</h3>
        <span className="text-sm font-bold text-slate-700">
          {dimension.score}/{dimension.maxScore}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percentage}%` }} />
      </div>
      <ul className="mt-2 space-y-1">
        {dimension.details.map((detail, idx) => (
          <li key={idx} className="text-xs text-slate-500">
            • {detail}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentResult = useAnalysisStore((s) => s.currentResult)

  const result = (location.state as { result?: AnalysisResult })?.result || currentResult

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

  const scoreColor = result.totalScore >= 85 ? 'text-emerald-600' : result.totalScore >= 60 ? 'text-amber-600' : 'text-red-600'
  const scoreBg = result.totalScore >= 85 ? 'bg-emerald-500' : result.totalScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
  const scoreBgLight = result.totalScore >= 85 ? 'bg-emerald-100' : result.totalScore >= 60 ? 'bg-amber-100' : 'bg-red-100'

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
        {/* 总分卡片 */}
        <div className={`rounded-2xl ${scoreBgLight} p-6 text-center shadow-sm`}>
          <p className="text-sm font-medium text-slate-600">健康评分</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <div className={`relative flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-sm`}>
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className={scoreBg}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${result.totalScore}, 100`}
                />
              </svg>
              <span className={`absolute text-4xl font-bold ${scoreColor}`}>{result.totalScore}</span>
            </div>
            <div className="text-left">
              <LevelBadge level={result.level} text={result.levelText} />
              <p className="mt-2 text-sm text-slate-700">{result.suggestion}</p>
            </div>
          </div>
        </div>

        {/* 三维度得分 */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <ScoreRing
            score={result.dimensions.ingredientCleanliness.score}
            maxScore={result.dimensions.ingredientCleanliness.maxScore}
            label="配料干净度"
            colorClass={result.dimensions.ingredientCleanliness.score >= 32 ? 'bg-emerald-500' : result.dimensions.ingredientCleanliness.score >= 24 ? 'bg-amber-500' : 'bg-red-500'}
          />
          <ScoreRing
            score={result.dimensions.nutritionQuality.score}
            maxScore={result.dimensions.nutritionQuality.maxScore}
            label="营养质量"
            colorClass={result.dimensions.nutritionQuality.score >= 40 ? 'bg-emerald-500' : result.dimensions.nutritionQuality.score >= 30 ? 'bg-amber-500' : 'bg-red-500'}
          />
          <ScoreRing
            score={result.dimensions.processingLevel.score}
            maxScore={result.dimensions.processingLevel.maxScore}
            label="加工程度"
            colorClass={result.dimensions.processingLevel.score >= 8 ? 'bg-emerald-500' : result.dimensions.processingLevel.score >= 5 ? 'bg-amber-500' : 'bg-red-500'}
          />
        </div>

        {/* 维度详情 */}
        <div className="mt-6 space-y-3">
          <DimensionCard dimension={result.dimensions.ingredientCleanliness} />
          <DimensionCard dimension={result.dimensions.nutritionQuality} />
          <DimensionCard dimension={result.dimensions.processingLevel} />
        </div>

        {/* 关注原因 */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900">分析摘要</h2>
          <div className="mt-3 space-y-2">
            {result.reasons.length === 0 ? (
              <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                整体表现不错，各项指标均在健康范围内
              </div>
            ) : (
              result.reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl p-3 text-sm ${
                    reason.type === 'positive'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {reason.type === 'positive' ? '✓' : '•'} {reason.text}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 配料解析 */}
        {result.ingredientBreakdown.some((i) => i.isAdditive) && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900">添加剂解析</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.ingredientBreakdown
                .filter((i) => i.isAdditive)
                .map((item) => (
                  <span
                    key={item.name}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                      item.riskLevel === 'high'
                        ? 'bg-red-100 text-red-700'
                        : item.riskLevel === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                    }`}
                    title={item.description}
                  >
                    {item.name}
                    <span className="ml-1 text-xs opacity-75">({item.category})</span>
                  </span>
                ))}
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
