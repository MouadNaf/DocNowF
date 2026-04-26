import { useState } from 'react'
import { usePromoteWaitlist } from '@/hooks/useSecretary'

export function PromoteModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [slot, setSlot] = useState('11:00')
  const m = usePromoteWaitlist()
  return <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}><div className="bg-white rounded-xl p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}><h3 className="font-semibold mb-2">Promouvoir vers un créneau</h3><div className="flex gap-2 mb-3">{['11:00', '14:00', '14:30'].map((s) => <button key={s} onClick={() => setSlot(s)} className={`px-3 py-1 rounded border ${slot === s ? 'bg-[#E8F7F1] border-[#1D9E75]' : ''}`}>{s}</button>)}</div><button className="w-full h-10 rounded bg-[#1D9E75] text-white" disabled={m.isPending} onClick={() => m.mutate({ id, slotTime: slot }, { onSuccess: onClose })}>Confirmer et notifier</button></div></div>
}

