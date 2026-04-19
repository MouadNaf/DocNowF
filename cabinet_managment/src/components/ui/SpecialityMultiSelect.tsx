import { useId } from 'react'
import { MEDICAL_SPECIALITY_OPTIONS } from '@/constants/medical-specialities'
import { cn } from '@/lib/utils/cn'

type Props = {
  label: string
  value: string[]
  onChange: (next: string[]) => void
  error?: string
  hint?: string
}

export function SpecialityMultiSelect({ label, value, onChange, error, hint }: Props) {
  const errId = `${useId()}-err`
  const toggle = (slug: string) => {
    if (value.includes(slug)) onChange(value.filter((x) => x !== slug))
    else onChange([...value, slug])
  }

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-slate-400">{label}</legend>
      {hint && <p className="mb-2 text-xs text-gray-500 dark:text-slate-500">{hint}</p>}
      <div
        className={cn(
          'max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-[#f7f8f7] p-3 dark:border-slate-600 dark:bg-slate-900/40',
          error && 'border-red-400',
        )}
        role="group"
        aria-describedby={error ? errId : undefined}
        aria-invalid={error ? true : undefined}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MEDICAL_SPECIALITY_OPTIONS.map((opt) => {
            const checked = value.includes(opt.value)
            return (
              <label
                key={opt.value}
                className={cn(
                  'flex cursor-pointer items-start gap-2.5 rounded-lg border border-transparent bg-white/90 px-2.5 py-2 transition-colors dark:bg-slate-800/80',
                  checked && 'border-[#1D9E75]/40 bg-[#EAF3DE]/60 dark:border-[#1D9E75]/50 dark:bg-emerald-950/30',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt.value)}
                  className="mt-0.5 size-4 shrink-0 rounded border-gray-300 accent-[#1D9E75]"
                />
                <span className="text-xs leading-snug text-gray-800 dark:text-slate-200">{opt.label}</span>
              </label>
            )
          })}
        </div>
      </div>
      {value.length > 0 && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-500">
          {value.length} {value.length === 1 ? 'speciality' : 'specialities'} selected
        </p>
      )}
      {error && (
        <p id={errId} className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}
