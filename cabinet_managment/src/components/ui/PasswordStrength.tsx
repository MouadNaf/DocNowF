import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const rules = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'At least one uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'At least one number', ok: /\d/.test(password) },
  ]
  const score = rules.filter((r) => r.ok).length
  const labelText = score === 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Strong' : ''

  return (
    <div>
      <div className="mt-2 mb-2 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full bg-gray-200 transition-all duration-300 dark:bg-slate-600',
              i < score && score === 1 && 'bg-red-400',
              i < score && score === 2 && 'bg-amber-400',
              i < score && score === 3 && 'bg-[#1D9E75]',
            )}
          />
        ))}
        {score > 0 && (
          <span
            className={cn(
              'text-xs font-medium',
              score === 1 && 'text-red-500',
              score === 2 && 'text-amber-500',
              score === 3 && 'text-[#1D9E75]',
            )}
          >
            {labelText}
          </span>
        )}
      </div>
      <div className="mt-1 flex flex-col flex-wrap gap-3">
        {rules.map((rule) => (
          <span
            key={rule.label}
            className={cn(
              'flex items-center gap-1 text-xs',
              rule.ok ? 'text-[#3B6D11]' : 'text-gray-400 dark:text-slate-500',
            )}
          >
            {rule.ok ? (
              <CheckCircle2 className="size-3 shrink-0 text-[#3B6D11]" aria-hidden />
            ) : (
              <Circle className="size-3 shrink-0 text-gray-400 dark:text-slate-500" aria-hidden />
            )}
            {rule.label}
          </span>
        ))}
      </div>
    </div>
  )
}
