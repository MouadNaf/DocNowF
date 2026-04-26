import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { usePatients, useTodaySchedule } from '@/hooks/useSecretary'

export function SecretaryPatientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: patients = [] } = usePatients()
  const { data: appointments = [] } = useTodaySchedule()
  const patient = patients.find((p) => p.id === id)
  const history = useMemo(() => appointments.filter((a) => a.patientId === id), [appointments, id])
  return <SecretaryLayout title="Fiche patient">{!patient ? <p>Patient introuvable</p> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><div className="bg-white border rounded-xl p-4"><h2 className="font-semibold mb-2">{patient.firstName} {patient.lastName}</h2><a href={`tel:${patient.phone}`} className="text-[#1D9E75]">{patient.phone}</a><p className="text-sm text-gray-600">{patient.email ?? 'Non renseigné'} - {patient.wilaya}</p></div><div className="bg-white border rounded-xl p-4"><h3 className="font-semibold mb-2">Historique des rendez-vous</h3><div className="space-y-2">{history.map((h) => <div key={h.id} className="border rounded p-2 text-sm">{h.time} - {h.consultationTypeName} - {h.status}</div>)}</div><button className="mt-3 h-10 px-4 rounded bg-[#1D9E75] text-white" onClick={() => navigate(`/secretary/walk-in?patient=${patient.id}`)}>Prendre un rendez-vous</button></div></div>}</SecretaryLayout>
}

