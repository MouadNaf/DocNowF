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
      <div className="bg-white border rounded-xl p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 border rounded-lg px-3 text-sm"
          />
          <input
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            placeholder="Rechercher patient (nom ou tél)..."
            className="h-10 border rounded-lg px-3 text-sm flex-1 min-w-48"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 border rounded-lg px-3 text-sm"
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
              className="h-10 px-4 border rounded-lg text-sm text-gray-500 hover:text-gray-700"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">
            {data.length} rendez-vous {date ? `— ${new Date(date + 'T00:00').toLocaleDateString('fr-FR')}` : ''}
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
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="py-2 px-3">Date & Heure</th>
                  <th className="py-2 px-3">Patient</th>
                  <th className="py-2 px-3">Téléphone</th>
                  <th className="py-2 px-3">Statut</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 font-medium">
                      {a.date} <span className="text-gray-400">à</span> {a.time}
                    </td>
                    <td className="py-2 px-3">{a.name ?? '—'}</td>
                    <td className="py-2 px-3 text-gray-500">{a.phone ?? '—'}</td>
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABEL[a.status] ?? a.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {a.status !== 'cancelled' && a.status !== 'completed' && (
                        <button
                          onClick={() => setCancelId(a.id)}
                          className="text-xs text-red-500 hover:underline"
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-80 shadow-xl">
            <h3 className="font-semibold mb-3">Confirmer l'annulation</h3>
            <textarea
              className="w-full border rounded p-2 text-sm mb-3 h-20 resize-none"
              placeholder="Motif (optionnel)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setCancelId(null)} className="px-4 py-2 text-sm border rounded-lg">Retour</button>
              <button
                onClick={() => {
                  cancel.mutate({ id: cancelId, reason: cancelReason })
                  setCancelId(null)
                  setCancelReason('')
                }}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg"
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
