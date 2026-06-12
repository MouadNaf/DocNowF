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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl shadow-sm">
              {(patient.name ?? '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-xl">{patient.name ?? '—'}</h2>
              <p className="text-sm font-medium text-gray-500 mt-0.5">{patient.gender === 'male' ? 'Homme' : patient.gender === 'female' ? 'Femme' : 'Genre non précisé'}</p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <InfoRow label="Téléphone" value={<a href={`tel:${patient.phone}`} className="font-semibold text-[#1D9E75] hover:underline">{patient.phone ?? '—'}</a>} />
            <InfoRow label="Email" value={patient.email ?? 'Non renseigné'} />
            <InfoRow label="Ville" value={patient.city ?? 'Non renseignée'} />
            <InfoRow label="Visites" value={
              <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-medium text-xs">
                {patient.visits} rendez-vous
              </span>
            } />
          </div>

          <button
            className="mt-8 w-full h-12 bg-[#1D9E75] hover:bg-[#168260] text-white rounded-xl text-sm font-medium transition-all shadow-sm shadow-[#1D9E75]/20"
            onClick={() => navigate(`/secretary/walk-in?patient=${id}`)}
          >
            Prendre un rendez-vous
          </button>
        </div>

        {/* Appointment history */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-5 text-gray-800 text-lg">Historique des rendez-vous</h3>
          {loadingApts ? (
            <p className="text-gray-400 text-sm">Chargement...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun historique.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {history.map((a) => (
                <div key={a.id} className="bg-gray-50/50 hover:bg-gray-50 rounded-xl p-4 text-sm flex justify-between items-center transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800">{a.date} <span className="text-gray-400 font-normal mx-1">à</span> {a.time}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-md font-medium shadow-sm ${
                    a.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                    a.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                    a.status === 'completed' ? 'bg-green-50 text-green-700' :
                    'bg-white text-gray-600'
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
    <div className="flex justify-between border-b border-gray-100 py-3.5 last:border-0 last:pb-0">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  )
}
