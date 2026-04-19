import { cn } from '@/lib/utils/cn'

const colors = {
  blue: 'border border-[#185FA5] bg-[#E6F1FB] text-[#0C447C]',
  green: 'border border-[#1D9E75] bg-[#EAF3DE] text-[#27500A]',
  teal: 'border border-[#0F6E56] bg-[#E1F5EE] text-[#085041]',
  purple: 'border border-[#534AB7] bg-[#EEEDFE] text-[#3C3489]',
  red: 'border border-[#A32D2D] bg-[#FCEBEB] text-[#791F1F]',
  amber: 'border border-[#BA7517] bg-[#FAEEDA] text-[#633806]',
  gray: 'border border-gray-200 bg-gray-100 text-gray-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300',
} as const

export function Badge({ color, label }: { color: keyof typeof colors; label: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', colors[color])}>{label}</span>
  )
}
