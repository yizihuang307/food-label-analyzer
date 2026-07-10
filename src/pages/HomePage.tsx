import { Button } from '@/components/Button'
import { useAnalysisStore } from '@/stores/analysisStore'
import { History, ScanLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()
  const history = useAnalysisStore((s) => s.history)
  const recent = history.slice(0, 3)

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
      <header className="safe-top px-5 pt-12 pb-8">
        <h1 className="text-3xl font-bold text-slate-900">食品标签营养师</h1>
        <p className="mt-2 text-slate-600">
          拍照识别营养成分表，获取 0-100 分健康评分
        </p>
      </header>

      <main className="flex-1 px-5">
        <div className="rounded-2xl bg-emerald-600 p-6 text-white shadow-lg">
          <h2 className="text-xl font-semibold">怎么评分？</h2>
          <div className="mt-4 space-y-3 text-emerald-50">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">40</span>
              <span>配料干净度（数量、添加剂、陌生成分）</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">50</span>
              <span>营养质量（钠、糖、脂肪、能量）</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">10</span>
              <span>加工程度（香精、色素、增稠剂等）</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <Button size="lg" className="w-full shadow-md" onClick={() => navigate('/scan')}>
            <ScanLine className="mr-2 h-5 w-5" />
            拍照分析食品标签
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/history')}>
            <History className="mr-2 h-5 w-5" />
            查看历史记录
          </Button>
        </div>

        {recent.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900">最近分析</h3>
            <div className="mt-3 space-y-3">
              {recent.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate('/result', { state: { result: item } })}
                  className="w-full rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{item.foodName}</span>
                    <span className="text-sm text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={`text-2xl font-bold ${scoreColor(item.totalScore)}`}>
                      {item.totalScore}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${scoreBg(item.totalScore)}`}>
                      {item.levelText}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="safe-bottom px-5 py-6 text-center text-sm text-slate-400">
        所有分析均在本地完成，不上传图片
      </footer>
    </div>
  )
}
