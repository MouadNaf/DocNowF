import { useState } from 'react'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { useAppointments, useCancelAppointment } from '@/hooks/useSecretary'

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  completed: 'Terminé',
  pending: 'En attente',
}
const STATUS_COLOR: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
}

export function SecretaryAppointmentsPage() {
  const [date, setDate]       = useState('')
  const [patient, setPatient] = useState('')
  const [status, setStatus]   = useState('')
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  const { data = [], isLoading } = useAppointments({
    date:    date    || undefined,
    patient: patient || undefined,
    status:  status  || undefined,
  })
  const cancel = useCancelAppointment()

  return (
    <SecretaryLayout title="Rendez-vous">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
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
          {(date || patient || status) && (
            <button
              onClick={() => { setDate(''); setPatient(''); setStatus('') }}
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
            {data.length} rendez-vous {date ? <span className="text-gray-400 font-normal ml-2">({new Date(date + 'T00:00').toLocaleDateString('fr-FR')})</span> : ''}
          </h2>
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-sm py-6 text-center">Chargement...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm py-6 text-center">Aucun résultat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-800">{a.date}</div>
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
                      {a.status !== 'cancelled' && a.status !== 'completed' && (
                        <button
                          onClick={() => setCancelId(a.id)}
                          className="text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Dialog */}
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
