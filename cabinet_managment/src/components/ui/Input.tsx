import { forwardRef, useId, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  success?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, success, id: idProp, 'aria-describedby': ariaDescribedBy, ...props }, ref) => {
    const uid = useId()
    const id = idProp ?? uid
    const errId = `${id}-error`
    const hintId = `${id}-hint`
    const describedBy = [error ? errId : null, !error && hint ? hintId : null, ariaDescribedBy].filter(Boolean).join(' ') || undefined

    return (
      <div>
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-slate-400">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF] [&>svg]:size-4">
              {icon}
            </span>
          )}
          <input
            id={id}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              'h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-all duration-150 placeholder:text-gray-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500',
              'focus:border-[#1D9E75] focus:shadow-[0_0_0_3px_rgba(29,158,117,0.15)] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75]',
              icon && 'pl-10',
              success && !error && 'border-[#3B6D11]',
              error &&
                'border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.12)] focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]',
              className,
            )}
            {...props}
          />
          {success && !error && (
            <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#3B6D11]" aria-hidden />
          )}
        </div>
        {error ? (
          <p id={errId} className="mt-1.5 flex items-center gap-1 text-xs text-red-500" role="alert">
            <AlertCircle className="size-3 shrink-0" aria-hidden />
            {error}
          </p>
        ) : (
          hint && (
            <p id={hintId} className="mt-1 text-xs text-gray-400 dark:text-slate-500">
              {hint}
            </p>
          )
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
