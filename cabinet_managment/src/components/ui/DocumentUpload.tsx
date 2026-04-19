import { useId, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT_EXT = ['.pdf', '.jpg', '.jpeg', '.png'] as const

function isAllowedFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return ACCEPT_EXT.some((ext) => name.endsWith(ext))
}

type Props = {
  label: string
  description: string
  value: File | null
  onChange: (file: File | null) => void
}

export function DocumentUpload({ label, description, value, onChange }: Props) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState('')

  const pick = () => inputRef.current?.click()

  const handleFile = (file: File | undefined) => {
    setLocalError('')
    if (!file) {
      onChange(null)
      return
    }
    if (file.size > MAX_BYTES) {
      setLocalError('File must be 5MB or smaller')
      return
    }
    if (!isAllowedFile(file)) {
      setLocalError('Use PDF, JPG, or PNG only')
      return
    }
    onChange(file)
  }

  const err = localError

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-slate-400">
        {label} <span className="text-red-500">*</span>
      </label>
      <p className="mb-2 text-xs text-gray-500 dark:text-slate-500">{description}</p>
      <div
        className={cn(
          'flex flex-col gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-[#f7f8f7] p-4 transition-colors dark:border-slate-600 dark:bg-slate-900/50',
          err && 'border-red-400',
        )}
      >
        <input
          id={id}
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="sr-only"
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={pick}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1D9E75]/30 bg-white px-3 py-2.5 text-xs font-semibold text-[#0f3d2f] shadow-sm transition-colors hover:border-[#1D9E75] hover:bg-[#EAF3DE]/50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <Upload className="size-4 shrink-0 text-[#1D9E75]" aria-hidden />
          {value ? 'Replace file' : 'Click to upload or browse'}
        </button>
        {value && <p className="truncate text-xs text-gray-700 dark:text-slate-300">{value.name}</p>}
        <p className="text-[10px] text-gray-400 dark:text-slate-500">PDF, JPG, PNG — max 5MB</p>
      </div>
      {err && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {err}
        </p>
      )}
    </div>
  )
}
