import { useState } from 'react'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { useAppointments, useCancelAppointment } from '@/hooks/useSecretary'
import { PayAppointmentModal, PaymentStatusBadge } from '@/components/secretary/PayAppointmentModal'
import type { SecretaryAppointment } from '@/types/secretary'

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  completed: 'Terminé',
  pending: 'En attente',
  arrived: 'Arrivé',
  no_show: 'Absent',
}
const STATUS_COLOR: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  arrived: 'bg-indigo-100 text-indigo-700',
  no_show: 'bg-orange-100 text-orange-700',
}

export function SecretaryAppointmentsPage() {
  const [date, setDate] = useState('')
  const [patient, setPatient] = useState('')
  const [status, setStatus] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [payApt, setPayApt] = useState<SecretaryAppointment | null>(null)

  const { data = [], isLoading } = useAppointments({
    date: date || undefined,
    patient: patient || undefined,
    status: status || undefined,
    payment_status: paymentFilter || undefined,
  })
  const cancel = useCancelAppointment()

  const unpaidCount = data.filter((a) => a.payment_status !== 'paid' && a.remaining_balance > 0).length

  return (
    <SecretaryLayout title="Rendez-vous">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { value: '', label: 'Tous les paiements' },
            { value: 'unpaid_or_partial', label: 'Impayés / Partiels' },
            { value: 'unpaid', label: 'Non payés' },
            { value: 'partial', label: 'Partiels' },
            { value: 'paid', label: 'Payés' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setPaymentFilter(f.value)}
              className={`h-9 px-4 rounded-xl text-xs font-semibold transition-all ${
                paymentFilter === f.value
                  ? 'bg-[#1D9E75] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 bg-gray-50 text-gray-700 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <input
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            placeholder="Rechercher patient (nom ou tél)..."
            className="h-11 bg-gray-50 text-gray-700 rounded-xl px-4 text-sm flex-1 min-w-48 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 bg-gray-50 text-gray-700 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">Tous les statuts</option>
            <option value="confirmed">Confirmé</option>
            <option value="cancelled">Annulé</option>
            <option value="completed">Terminé</option>
            <option value="pending">En attente</option>
          </select>
          {(date || patient || status || paymentFilter) && (
            <button
              onClick={() => {
                setDate('')
                setPatient('')
                setStatus('')
                setPaymentFilter('')
              }}
              className="h-11 px-5 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 text-lg">
            {data.length} rendez-vous
            {date && (
              <span className="text-gray-400 font-normal ml-2">
                ({new Date(date + 'T00:00').toLocaleDateString('fr-FR')})
              </span>
            )}
          </h2>
          {unpaidCount > 0 && (
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
              {unpaidCount} avec solde restant
            </span>
          )}
        </div>

        {!date && (
          <p className="text-xs text-gray-400 mb-4">
            Historique complet affiché (plus récents en premier). Filtrez par date pour une journée précise.
          </p>
        )}

        {isLoading ? (
          <p className="text-gray-400 text-sm py-6 text-center">Chargement...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm py-6 text-center">Aucun résultat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4">Statut RDV</th>
                  <th className="py-3 px-4">Paiement</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((a) => {
                  const canPay = a.status !== 'cancelled' && a.remaining_balance > 0
                  return (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">
                          {new Date(a.date + 'T00:00').toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{a.time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">{a.name ?? '—'}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{a.phone ?? '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABEL[a.status] ?? a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <PaymentStatusBadge apt={a} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs space-y-0.5">
                          <p className="text-gray-600">Total: <span className="font-semibold">{a.fee.toLocaleString('fr-FR')} DA</span></p>
                          {(a.paid_amount ?? 0) > 0 && (
                            <p className="text-green-600">Payé: {a.paid_amount.toLocaleString('fr-FR')} DA</p>
                          )}
                          {a.remaining_balance > 0 && (
                            <p className="text-orange-600 font-semibold">Reste: {a.remaining_balance.toLocaleString('fr-FR')} DA</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          {canPay && (
                            <button
                              onClick={() => setPayApt(a)}
                              className="text-xs font-medium text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {a.payment_status === 'partial' ? 'Compléter' : 'Encaisser'}
                            </button>
                          )}
                          {a.status !== 'cancelled' && a.status !== 'completed' && (
                            <button
                              onClick={() => setCancelId(a.id)}
                              className="text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {payApt && <PayAppointmentModal apt={payApt} onClose={() => setPayApt(null)} />}

      {cancelId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
          <div className="bg-white rounded-3xl p-6 w-[22rem] shadow-2xl">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Confirmer l'annulation</h3>
            <textarea
              className="w-full bg-gray-50 text-gray-700 rounded-xl p-4 text-sm mb-5 h-24 resize-none outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-400"
              placeholder="Motif de l'annulation (optionnel)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCancelId(null)}
                className="px-5 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Retour
              </button>
              <button
                onClick={() => {
                  cancel.mutate({ id: cancelId, reason: cancelReason })
                  setCancelId(null)
                  setCancelReason('')
                }}
                className="px-5 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-sm shadow-red-500/20"
              >
                Annuler le RDV
              </button>
            </div>
          </div>
        </div>
      )}
    </SecretaryLayout>
  )
}
