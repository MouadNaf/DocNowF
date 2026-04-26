import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { ROUTES } from '@/constants/routes'
import { usePatients } from '@/hooks/useSecretary'

export function SecretaryPatientsPage() {
  const [search, setSearch] = useState('')
  const { data = [] } = usePatients(search)
  const navigate = useNavigate()
  const list = useMemo(() => data, [data])
  return <SecretaryLayout title="Patients"><div className="mb-3 flex gap-2"><input value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 border rounded-lg px-3 flex-1" placeholder="Rechercher par nom ou téléphone..." /><button className="h-10 px-4 bg-[#1D9E75] text-white rounded-lg" onClick={() => navigate(ROUTES.SECRETARY_PATIENT_NEW)}>Nouveau patient</button></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{list.map((p) => <div key={p.id} className="bg-white border rounded-xl p-3"><p className="font-semibold">{p.firstName} {p.lastName}</p><a className="text-sm text-[#1D9E75]" href={`tel:${p.phone}`}>{p.phone}</a><p className="text-xs text-gray-500">{p.wilaya} - {p.totalVisits} visites</p><button className="mt-2 text-sm border rounded px-2 py-1" onClick={() => navigate(`/secretary/patients/${p.id}`)}>Voir profil</button></div>)}</div></SecretaryLayout>
}

