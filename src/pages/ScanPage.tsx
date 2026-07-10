import { Button } from '@/components/Button'
import { useAnalysisStore } from '@/stores/analysisStore'
import { getDefaultNutrients, parseNutritionLabel } from '@/utils/ocrParser'
import { createWorker } from 'tesseract.js'
import { Camera, ImageIcon, Loader2, PenLine } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const OCR_LANG_PATH = 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/chi_sim/4.0.0_best_int'

export function ScanPage() {
  const navigate = useNavigate()
  const setCurrentAnalysis = useAnalysisStore((s) => s.setCurrentAnalysis)
  const setCurrentImage = useAnalysisStore((s) => s.setCurrentImage)

  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file)
    setImage(url)
    setCurrentImage(url)
    setError(null)
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleCamera = () => {
    fileInputRef.current?.click()
  }

  const runOcr = async () => {
    if (!image) return

    setLoading(true)
    setLoadingText('正在加载 OCR 语言模型...')
    setError(null)

    try {
      const worker = await createWorker('chi_sim', 1, {
        logger: (m) => {
          console.log('[OCR]', m)
          if (m.status === 'loading language traineddata') {
            setLoadingText('正在加载中文识别模型...')
          } else if (m.status === 'recognizing text') {
            setLoadingText(`正在识别... ${Math.round(m.progress * 100)}%`)
          }
        },
        errorHandler: (err) => {
          console.error('[OCR Worker Error]', err)
        },
        langPath: OCR_LANG_PATH,
      })

      setLoadingText('正在识别图片中的文字...')
      const { data: { text } } = await worker.recognize(image)
      await worker.terminate()

      console.log('OCR raw text:', text)

      if (!text || text.trim().length < 5) {
        setError('图片中文字太少或无法识别，建议换一张更清晰的图片，或手动输入')
        setLoading(false)
        return
      }

      const parsed = parseNutritionLabel(text)

      const analysis = {
        id: crypto.randomUUID(),
        foodName: parsed.foodName || '',
        image,
        servingSize: 1,
        servingUnit: '份',
        nutrientsPer100g: { ...getDefaultNutrients(), ...parsed.nutrients } as ReturnType<typeof getDefaultNutrients>,
        ingredients: parsed.ingredients,
        rawOcrText: text,
        createdAt: Date.now(),
      }

      setCurrentAnalysis(analysis)
      navigate('/review')
    } catch (err) {
      console.error('OCR error:', err)
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('network') || message.includes('fetch')) {
        setError('识别模型下载失败，请检查网络，或选择手动输入')
      } else {
        setError('识别失败，请手动输入营养成分')
      }
      setLoading(false)
    }
  }

  const skipToManual = () => {
    const analysis = {
      id: crypto.randomUUID(),
      foodName: '',
      image: image || undefined,
      servingSize: 1,
      servingUnit: '份',
      nutrientsPer100g: getDefaultNutrients(),
      ingredients: [],
      createdAt: Date.now(),
    }
    setCurrentAnalysis(analysis)
    navigate('/review')
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
        <h1 className="mt-2 text-2xl font-bold text-slate-900">上传营养成分表</h1>
      </header>

      <main className="flex-1 px-5">
        {!image ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8">
            <div className="rounded-full bg-emerald-100 p-4">
              <Camera className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="mt-4 text-center text-slate-600">
              拍摄或上传食品包装上的营养成分表
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleUpload}
            />
            <div className="mt-6 flex w-full flex-col gap-3">
              <Button onClick={handleCamera} className="w-full">
                <Camera className="mr-2 h-5 w-5" />
                拍照 / 选择图片
              </Button>
              <Button variant="outline" onClick={skipToManual} className="w-full">
                <PenLine className="mr-2 h-5 w-5" />
                跳过拍照，手动输入
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img
                src={image}
                alt="食品标签"
                className="max-h-80 w-full object-contain"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-6">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="mt-3 text-sm text-slate-600">{loadingText}</p>
                <p className="mt-2 text-xs text-slate-400">首次使用需下载约 10MB 模型</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button onClick={runOcr} className="w-full">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  识别营养成分表
                </Button>
                <Button variant="outline" onClick={skipToManual} className="w-full">
                  <PenLine className="mr-2 h-5 w-5" />
                  手动输入
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setImage(null)
                    setCurrentImage(null)
                  }}
                  className="w-full"
                >
                  重新选择图片
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="safe-bottom px-5 py-6 text-center text-sm text-slate-400">
        图片仅在本地处理，不会上传到服务器
      </footer>
    </div>
  )
}
