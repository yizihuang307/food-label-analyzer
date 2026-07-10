import type { ScoreLevel } from '@/types'

interface ScoreBadgeProps {
  score: ScoreLevel
  label: string
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreBadge({ score, label, size = 'md' }: ScoreBadgeProps) {
  const styles = {
    green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    yellow: 'bg-amber-100 text-amber-800 border-amber-200',
    red: 'bg-red-100 text-red-800 border-red-200',
  }

  const dot = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${styles[score]} ${sizes[size]}`}
    >
      <span className={`h-2 w-2 rounded-full ${dot[score]}`} />
      {label}
    </span>
  )
}
