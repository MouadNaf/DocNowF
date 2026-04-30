import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { usePatients } from '@/hooks/useSecretary'
import { ROUTES } from '@/constants/routes'

export function SecretaryPatientsPage() {
  const [search, setSearch] = useState('')
  const { data = [], isLoading } = usePatients(search)
  const navigate = useNavigate()

  return (
    <SecretaryLayout title="Patients">
      <div className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 border rounded-lg px-3 flex-1 text-sm"
          placeholder="Rechercher par nom ou téléphone..."
        />
        <button
          className="h-10 px-4 bg-[#1D9E75] text-white rounded-lg text-sm font-medium"
          onClick={() => navigate(ROUTES.SECRETARY_PATIENT_NEW)}
        >
          + Nouveau patient
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm py-6 text-center">Chargement...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-400 text-sm py-6 text-center">
          {search ? `Aucun patient trouvé pour "${search}".` : 'Aucun patient enregistré.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {data.map((p) => (
            <div key={p.id} className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{p.name ?? '—'}</p>
                  <a
                    href={`tel:${p.phone}`}
                    className="text-sm text-[#1D9E75] hover:underline"
                  >
                    {p.phone ?? '—'}
                  </a>
                  {p.city && <p className="text-xs text-gray-400 mt-0.5">{p.city}</p>}
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-medium">
                  {p.visits} visite{p.visits !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                className="mt-3 text-sm text-gray-500 border rounded-lg px-3 py-1 hover:bg-gray-50 w-full"
                onClick={() => navigate(`/secretary/patients/${p.id}`)}
              >
                Voir le profil
              </button>
            </div>
          ))}
        </div>
      )}
    </SecretaryLayout>
  )
}
