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
      <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 bg-gray-50 text-gray-700 rounded-xl px-4 flex-1 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/20 transition-all placeholder:text-gray-400 min-w-[200px]"
          placeholder="Rechercher par nom ou téléphone..."
        />
        <button
          className="h-11 px-6 bg-[#1D9E75] hover:bg-[#168260] text-white rounded-xl text-sm font-medium transition-all shadow-sm shadow-[#1D9E75]/20"
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
            <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800 text-lg">{p.name ?? '—'}</p>
                  <a
                    href={`tel:${p.phone}`}
                    className="text-sm font-medium text-[#1D9E75] hover:underline"
                  >
                    {p.phone ?? '—'}
                  </a>
                  {p.city && <p className="text-xs text-gray-400 mt-1">{p.city}</p>}
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-medium shadow-sm">
                  {p.visits} visite{p.visits !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                className="mt-5 text-sm font-medium text-[#1D9E75] bg-[#1D9E75]/10 hover:bg-[#1D9E75]/20 rounded-xl px-4 py-2.5 w-full transition-colors"
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
