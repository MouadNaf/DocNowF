import { useNavigate, useParams } from 'react-router-dom'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { usePatients, useAppointments } from '@/hooks/useSecretary'

export function SecretaryPatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: patients = [], isLoading: loadingPatient } = usePatients()
  const { data: appointments = [], isLoading: loadingApts } = useAppointments()

  const patient = patients.find((p) => String(p.id) === id)
  const history = appointments.filter((a) => String(a.patient_id) === id)

  if (loadingPatient) {
    return (
      <SecretaryLayout title="Fiche patient">
        <p className="text-gray-400 text-sm py-6 text-center">Chargement...</p>
      </SecretaryLayout>
    )
  }

  if (!patient) {
    return (
      <SecretaryLayout title="Fiche patient">
        <p className="text-gray-500 text-sm py-6 text-center">Patient introuvable.</p>
      </SecretaryLayout>
    )
  }

  return (
    <SecretaryLayout title="Fiche patient">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Patient info */}
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {(patient.name ?? '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 text-lg">{patient.name ?? '—'}</h2>
              <p className="text-sm text-gray-500">{patient.gender === 'male' ? 'Homme' : patient.gender === 'female' ? 'Femme' : 'Genre non précisé'}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <InfoRow label="Téléphone" value={<a href={`tel:${patient.phone}`} className="text-[#1D9E75] hover:underline">{patient.phone ?? '—'}</a>} />
            <InfoRow label="Email" value={patient.email ?? 'Non renseigné'} />
            <InfoRow label="Ville" value={patient.city ?? 'Non renseignée'} />
            <InfoRow label="Visites" value={`${patient.visits} rendez-vous`} />
          </div>

          <button
            className="mt-5 w-full h-10 bg-[#1D9E75] text-white rounded-lg text-sm font-medium"
            onClick={() => navigate(`/secretary/walk-in?patient=${id}`)}
          >
            Prendre un rendez-vous
          </button>
        </div>

        {/* Appointment history */}
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-3 text-gray-800">Historique des rendez-vous</h3>
          {loadingApts ? (
            <p className="text-gray-400 text-sm">Chargement...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun historique.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {history.map((a) => (
                <div key={a.id} className="border rounded-lg p-3 text-sm flex justify-between items-center">
                  <div>
                    <p className="font-medium">{a.date} à {a.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    a.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    a.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    a.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SecretaryLayout>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b pb-2 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  )
}
