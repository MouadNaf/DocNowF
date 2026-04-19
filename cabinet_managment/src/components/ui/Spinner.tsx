import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' } as const

export function Spinner({ size = 'md' }: { size?: keyof typeof sizeMap }) {
  return <Loader2 className={cn('animate-spin text-gray-400 dark:text-slate-500', sizeMap[size])} aria-hidden />
}
