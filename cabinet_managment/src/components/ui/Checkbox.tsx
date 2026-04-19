import { useId, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

type Props = {
  label: ReactNode
  error?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export function Checkbox({ label, error, checked, onChange }: Props) {
  const id = useId()
  const errId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-[#1D9E75] text-[#1D9E75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75]/40 focus-visible:ring-offset-2 dark:border-slate-600 dark:focus-visible:ring-offset-slate-900"
        />
        <span className="text-xs leading-relaxed text-gray-600 dark:text-slate-400 [&_a]:font-medium [&_a]:text-[#185FA5] [&_a]:hover:underline dark:[&_a]:text-blue-400">
          {label}
        </span>
      </label>
      {error && (
        <p id={errId} className="mt-1 flex items-center gap-1 pl-6 text-xs text-red-500" role="alert">
          <AlertCircle className="size-3 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}
