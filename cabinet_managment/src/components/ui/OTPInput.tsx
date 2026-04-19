import { useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'

type Props = {
  length?: number
  onComplete: (code: string) => void
  onChange?: (code: string) => void
  hasError?: boolean
}

export function OTPInput({ length = 6, onComplete, onChange, hasError }: Props) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''))
  const [focused, setFocused] = useState<number | null>(null)
  const refs = useRef<Array<HTMLInputElement | null>>([])

  const emit = (next: string[]) => {
    const code = next.join('')
    onChange?.(code)
    if (next.every(Boolean)) onComplete(code)
  }

  return (
    <div
      role="group"
      aria-label="One-time password"
      className={cn('flex justify-center gap-1.5 sm:gap-2', hasError && 'otp-error')}
    >
      {values.map((value, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          aria-label={`Digit ${i + 1} of ${length}`}
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(-1)
            const next = [...values]
            next[i] = v
            setValues(next)
            emit(next)
            if (v && i < length - 1) refs.current[i + 1]?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !values[i] && i > 0) refs.current[i - 1]?.focus()
            if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
            if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus()
          }}
          onFocus={() => setFocused(i)}
          onBlur={() => setFocused(null)}
          onPaste={(e) => {
            e.preventDefault()
            const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length).split('')
            const next = Array(length)
              .fill('')
              .map((_, idx) => digits[idx] || '')
            setValues(next)
            emit(next)
            refs.current[Math.min(digits.length, length - 1)]?.focus()
          }}
          className={cn(
            'h-[52px] w-11 rounded-xl border-2 bg-white text-center text-xl font-semibold text-gray-900 outline-none transition-all duration-150 dark:bg-slate-800 dark:text-slate-100',
            hasError
              ? 'border-red-400 bg-red-50 dark:bg-red-950/30'
              : value
                ? 'border-[#1D9E75] bg-[#EAF3DE]/40'
                : 'border-gray-300 dark:border-slate-600',
            focused === i &&
              !hasError &&
              'border-[#1D9E75] ring-2 ring-[#1D9E75]/20 dark:ring-[#1D9E75]/30',
            'focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75]',
          )}
        />
      ))}
    </div>
  )
}
