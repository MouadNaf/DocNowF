import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Input } from './Input'

type Props = Omit<React.ComponentProps<typeof Input>, 'type'>

export const PasswordInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const [show, setShow] = useState(false)
  const { className, ...rest } = props
  const hasLabel = Boolean(rest.label)
  return (
    <div className="relative">
      <Input ref={ref} type={show ? 'text' : 'password'} className={cn('pr-10', className)} {...rest} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className={cn(
          'absolute right-3 cursor-pointer rounded p-0.5 text-gray-400 transition-colors duration-150 hover:text-gray-600 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] dark:hover:text-slate-300',
          hasLabel ? 'top-8.5' : 'top-1/2 -translate-y-1/2',
        )}
        aria-label={show ? 'Hide password' : 'Show password'}
        disabled={props.disabled}
      >
        {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  )
})

PasswordInput.displayName = 'PasswordInput'
