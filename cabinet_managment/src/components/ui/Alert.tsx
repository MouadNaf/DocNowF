import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const styles = {
  error: 'bg-[#FCEBEB] text-[#7F1D1D] border-[#FCA5A5]',
  success: 'bg-[#EAF3DE] text-[#14532D] border-[#86EFAC]',
  info: 'bg-[#E6F1FB] text-[#1E3A5F] border-[#93C5FD]',
  warning: 'bg-[#FAEEDA] text-[#78350F] border-[#FCD34D]',
} as const

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
} as const

const iconColors = {
  error: 'text-[#DC2626]',
  success: 'text-[#16A34A]',
  info: 'text-[#3B82F6]',
  warning: 'text-[#D97706]',
} as const

export function Alert({ type, message, onClose }: { type: keyof typeof styles; message: string; onClose?: () => void }) {
  const Icon = icons[type]
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm dark:border-opacity-80',
        styles[type],
      )}
      role="alert"
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', iconColors[type])} aria-hidden />
      <p className="min-w-0 flex-1 leading-relaxed">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-auto shrink-0 text-current opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75]"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
