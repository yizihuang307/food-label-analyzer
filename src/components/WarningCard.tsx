import type { Warning } from '@/types'

interface WarningCardProps {
  warning: Warning
}

export function WarningCard({ warning }: WarningCardProps) {
  const styles = {
    green: 'bg-emerald-50 border-emerald-200',
    yellow: 'bg-amber-50 border-amber-200',
    red: 'bg-red-50 border-red-200',
  }

  const icons = {
    green: '✓',
    yellow: '⚠️',
    red: '✕',
  }

  return (
    <div className={`rounded-xl border p-3 ${styles[warning.level]}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{icons[warning.level]}</span>
        <div>
          <h4 className="font-semibold text-slate-900">{warning.title}</h4>
          <p className="text-sm text-slate-600 mt-0.5">{warning.description}</p>
        </div>
      </div>
    </div>
  )
}
