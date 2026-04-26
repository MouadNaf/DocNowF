import { CheckCircle } from 'lucide-react'
import { useMarkAsArrived } from '@/hooks/useSecretary'

export function MarkArrivedButton({ id }: { id: string }) {
  const mutation = useMarkAsArrived()
  return (
    <button
      onClick={() => mutation.mutate(id)}
      disabled={mutation.isPending}
      className="h-8 px-2 rounded bg-[#1D9E75] text-white text-xs flex items-center gap-1 disabled:opacity-60"
    >
      <CheckCircle size={12} />
      {mutation.isPending ? '...' : 'ArrivÃ©'}
    </button>
  )
}

