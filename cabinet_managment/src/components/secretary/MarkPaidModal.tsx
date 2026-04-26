import { useState } from 'react'
import { formatDa, type SecretaryAppointment, type SecretaryPaymentMethod } from '@/lib/mock/secretary.mock'
import { useMarkAsPaid } from '@/hooks/useSecretary'

const methods: Array<{ id: SecretaryPaymentMethod; label: string }> = [
  { id: 'cash', label: 'EspÃ¨ces' },
  { id: 'card', label: 'Carte bancaire' },
  { id: 'ccp', label: 'CCP' },
  { id: 'virement', label: 'Virement' },
]

export function MarkPaidModal({ appointment, onClose }: { appointment: SecretaryAppointment; onClose: () => void }) {
  const [paymentMethod, setPaymentMethod] = useState<SecretaryPaymentMethod>('cash')
  const [notes, setNotes] = useState('')
  const m = useMarkAsPaid()
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-3">Encaisser le paiement</h3>
        <div className="bg-gray-50 rounded-xl p-3 mb-3">
          <p className="text-sm">{appointment.patientName}</p>
          <p className="text-lg font-bold text-green-700">{formatDa(appointment.fee)}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {methods.map((method) => (
            <button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`rounded-lg border p-2 text-sm ${paymentMethod === method.id ? 'border-[#1D9E75] bg-[#E8F7F1]' : ''}`}>
              {method.label}
            </button>
          ))}
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded-lg p-2 text-sm mb-3" placeholder="Remarque (optionnel)" maxLength={100} />
        <button
          className="w-full rounded-lg h-10 bg-[#1D9E75] text-white"
          onClick={() => m.mutate({ id: appointment.id, data: { paymentMethod, notes } }, { onSuccess: onClose })}
          disabled={m.isPending}
        >
          {m.isPending ? 'Enregistrement...' : 'Confirmer le paiement'}
        </button>
      </div>
    </div>
  )
}

