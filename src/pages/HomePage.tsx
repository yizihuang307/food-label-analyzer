import { Button } from '@/components/Button'
import { useAnalysisStore } from '@/stores/analysisStore'
import { History, ScanLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()
  const history = useAnalysisStore((s) => s.history)
  const recent = history.slice(0, 3)

  return (
    <div className="min-h-svh flex flex-col">
      <header className="safe-top px-5 pt-12 pb-8">
        <h1 className="text-3xl font-bold text-slate-900">食品标签营养师</h1>
        <p className="mt-2 text-slate-600">
          拍照识别营养成分表，快速判断配料干净度和营养健康度
        </p>
      </header>

      <main className="flex-1 px-5">
        <div className="rounded-2xl bg-emerald-600 p-6 text-white shadow-lg">
          <h2 className="text-xl font-semibold">适合谁用？</h2>
          <ul className="mt-3 space-y-2 text-emerald-50">
            <li>• 看不懂营养成分表的小白</li>
            <li>• 想快速对比食品的营养师</li>
            <li>• 关注添加剂和配料表的消费者</li>
          </ul>
        </div>

        <div className="mt-6 grid gap-4">
          <Button
            size="lg"
            className="w-full shadow-md"
            onClick={() => navigate('/scan')}
          >
            <ScanLine className="mr-2 h-5 w-5" />
            拍照分析食品标签
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate('/history')}
          >
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
                  <div className="mt-2 flex gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.ingredientScore === 'green'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.ingredientScore === 'yellow'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      配料{item.ingredientScore === 'green' ? '干净' : item.ingredientScore === 'yellow' ? '一般' : '复杂'}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.nutritionScore === 'green'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.nutritionScore === 'yellow'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      营养{item.nutritionScore === 'green' ? '可常吃' : item.nutritionScore === 'yellow' ? '适量吃' : '少吃'}
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
