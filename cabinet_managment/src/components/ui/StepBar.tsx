import { cn } from '@/lib/utils/cn'

export function StepBar({ total, current }: { total: number; current: number }) {
  return (
    <div className="mb-7 flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full transition-all duration-300',
            i < current ? 'bg-[#1D9E75]' : i === current ? 'bg-[#378ADD]' : 'bg-gray-200 dark:bg-slate-700',
          )}
        />
      ))}
    </div>
  )
}
