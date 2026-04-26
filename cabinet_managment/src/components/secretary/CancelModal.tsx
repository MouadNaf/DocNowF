import { useState } from 'react'
import { useCancelAppointment } from '@/hooks/useSecretary'

export function CancelModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const m = useCancelAppointment()
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-1">Annuler ce rendez-vous ?</h3>
        <p className="text-xs text-gray-500 mb-2">Le patient sera notifie par SMS.</p>
        <textarea className="w-full border rounded-lg p-2 text-sm mb-3" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif (min 10 caracteres)" />
        <button disabled={reason.trim().length < 10 || m.isPending} className="w-full h-10 rounded-lg bg-red-600 text-white disabled:opacity-60" onClick={() => m.mutate({ id, reason }, { onSuccess: onClose })}>
          Oui, annuler
        </button>
      </div>
    </div>
  )
}
