import { Button } from '@/components/Button'
import { useAnalysisStore } from '@/stores/analysisStore'
import { Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function HistoryPage() {
  const navigate = useNavigate()
  const history = useAnalysisStore((s) => s.history)
  const deleteResult = useAnalysisStore((s) => s.deleteResult)
  const clearHistory = useAnalysisStore((s) => s.clearHistory)

  const scoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const scoreBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-100 text-emerald-700'
    if (score >= 60) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
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
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">历史记录</h1>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-sm text-red-500 hover:text-red-700"
            >
              清空
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 px-5 pb-8">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-16">
            <p className="text-slate-500">还没有分析记录</p>
            <Button onClick={() => navigate('/scan')} className="mt-4">
              去分析第一个食品
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => navigate('/result', { state: { result: item } })}
                    className="flex-1 text-left"
                  >
                    <p className="font-semibold text-slate-900">{item.foodName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString('zh-CN')}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className={`text-2xl font-bold ${scoreColor(item.totalScore)}`}>
                        {item.totalScore}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${scoreBg(item.totalScore)}`}>
                        {item.levelText}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => deleteResult(item.id)}
                    className="ml-2 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="删除"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
