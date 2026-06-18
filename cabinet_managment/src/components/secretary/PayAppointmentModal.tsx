import { useState } from 'react'
import { useMarkAsPaid } from '@/hooks/useSecretary'
import type { SecretaryAppointment } from '@/types/secretary'

function formatDa(amount: number) {
  return `${amount.toLocaleString('fr-FR')} DA`
}

export function PayAppointmentModal({ apt, onClose }: { apt: SecretaryAppointment; onClose: () => void }) {
  const pay = useMarkAsPaid()
  const [method, setMethod] = useState('cash')
  const remaining = apt.remaining_balance ?? Math.max(0, apt.fee - (apt.paid_amount ?? 0))
  const [amount, setAmount] = useState(remaining > 0 ? remaining.toString() : apt.fee.toString())
  const [note, setNote] = useState('')

  const parsedAmount = Number(amount) || 0
  const afterPayment = Math.max(0, remaining - parsedAmount)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-[420px] shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Enregistrer le paiement</h3>
        <p className="text-sm text-gray-500 mb-4">{apt.name} — {apt.date} à {apt.time}</p>

        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-xl text-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total</p>
            <p className="text-sm font-bold text-gray-900">{formatDa(apt.fee)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Payé</p>
            <p className="text-sm font-bold text-green-600">{formatDa(apt.paid_amount ?? 0)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Reste</p>
            <p className="text-sm font-bold text-orange-600">{formatDa(remaining)}</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Montant à encaisser (DA)</label>
            <input
              type="number"
              min={0.01}
              max={remaining}
              step={0.01}
              className="w-full h-11 border-2 border-gray-50 rounded-xl px-4 font-bold text-lg focus:border-green-200 focus:outline-none"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {parsedAmount > 0 && parsedAmount < remaining && (
              <p className="text-xs text-orange-600 mt-1 font-medium">
                Paiement partiel — reste après encaissement : {formatDa(afterPayment)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mode de paiement</label>
            <div className="grid grid-cols-2 gap-2">
              {['cash', 'card', 'ccp', 'virement'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`h-10 rounded-lg text-xs font-bold border-2 transition-all ${method === m ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-50 text-gray-400'}`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 text-sm font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            Annuler
          </button>
          <button
            onClick={() =>
              pay.mutate(
                { id: apt.id, data: { paymentMethod: method, amount: parsedAmount, notes: note } },
                { onSuccess: onClose },
              )
            }
            disabled={pay.isPending || parsedAmount <= 0 || parsedAmount > remaining}
            className="flex-1 h-11 text-sm font-bold bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-lg shadow-green-200 transition-all disabled:opacity-50"
          >
            {pay.isPending ? 'Traitement...' : parsedAmount >= remaining ? 'Marquer payé' : 'Paiement partiel'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PaymentStatusBadge({ apt }: { apt: SecretaryAppointment }) {
  const remaining = apt.remaining_balance ?? Math.max(0, apt.fee - (apt.paid_amount ?? 0))

  if (apt.payment_status === 'paid' || remaining <= 0) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          Payé
        </span>
        {(apt.paid_amount ?? 0) > 0 && (
          <span className="text-[10px] text-gray-400">{formatDa(apt.paid_amount ?? apt.fee)}</span>
        )}
      </div>
    )
  }

  if (apt.payment_status === 'partial' || (apt.paid_amount ?? 0) > 0) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
          Partiel
        </span>
        <span className="text-[10px] text-orange-600 font-medium">Reste {formatDa(remaining)}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
        <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
        Non payé
      </span>
      {apt.fee > 0 && <span className="text-[10px] text-gray-400">{formatDa(apt.fee)}</span>}
    </div>
  )
}
