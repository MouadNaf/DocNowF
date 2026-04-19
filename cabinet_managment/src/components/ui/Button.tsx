import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  loading?: boolean
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary:
    'bg-[#1D9E75] text-white hover:bg-[#189068] focus-visible:ring-2 focus-visible:ring-[#1D9E75]/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
  outline:
    'border border-gray-300 bg-transparent text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] dark:text-slate-400 dark:hover:bg-slate-800',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, loading, variant = 'primary', fullWidth, size = 'md', children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium outline-none transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        variant === 'ghost' ? 'h-10 px-3 text-sm' : sizes[size],
        loading && 'pointer-events-none opacity-70',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="mr-2 size-4 shrink-0 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
)

Button.displayName = 'Button'
