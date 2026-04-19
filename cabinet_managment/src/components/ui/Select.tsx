import { forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Option = { value: string; label: string }
type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  placeholder?: string
  options: Option[]
}

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, placeholder, options, className, id: idProp, 'aria-describedby': ariaDescribedBy, ...props }, ref) => {
    const uid = useId()
    const id = idProp ?? uid
    const errId = `${id}-error`
    const describedBy = [error ? errId : null, ariaDescribedBy].filter(Boolean).join(' ') || undefined

    return (
      <div>
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-slate-400">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={id}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              'h-11 w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 outline-none transition-all duration-150 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100',
              'focus:border-[#1D9E75] focus:shadow-[0_0_0_3px_rgba(29,158,117,0.15)] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75]',
              error &&
                'border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.12)] focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]',
              className,
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-500 dark:text-slate-400" aria-hidden />
        </div>
        {error && (
          <p id={errId} className="mt-1.5 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'
