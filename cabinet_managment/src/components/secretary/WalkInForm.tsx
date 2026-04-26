import { useState } from 'react'
import { useCreateWalkIn } from '@/hooks/useSecretary'
import { PatientSearchInput } from './PatientSearchInput'
import { NewPatientForm } from './NewPatientForm'

export function WalkInForm() {
  const [patientId, setPatientId] = useState<string | undefined>()
  const [newPatient, setNewPatient] = useState<Record<string, unknown> | undefined>()
  const [showNew, setShowNew] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('10:30')
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const m = useCreateWalkIn()
  if (success) return <div className="bg-white rounded-xl border p-6"><p className="text-green-700 font-semibold mb-2">Rendez-vous créé avec succès !</p><p className="text-sm mb-4">{success}</p><button className="h-10 px-4 rounded bg-[#1D9E75] text-white" onClick={() => { setSuccess(null); setPatientId(undefined); setNewPatient(undefined); setShowNew(false); setNotes(''); }}>Autre rendez-vous</button></div>
  return (
    <div className="bg-white rounded-xl border p-4 space-y-4">
      <PatientSearchInput onPatientSelect={(id) => { setPatientId(id); setShowNew(false); }} onNewPatient={() => setShowNew(true)} />
      {showNew && <NewPatientForm onCreate={(data) => { setNewPatient(data); setShowNew(false); }} />}
      <div className="grid grid-cols-2 gap-2">
        <input type="date" className="border rounded-lg p-2" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" className="border rounded-lg p-2" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <div className="rounded bg-gray-100 p-2 text-sm">Diagnostic simple - 2,000 DA / 30 min (lecture seule)</div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded-lg p-2 text-sm" placeholder="Notes de réception (optionnel)" />
      <button className="h-10 w-full rounded-lg bg-[#1D9E75] text-white" disabled={m.isPending} onClick={() => m.mutate({ patientId, newPatient, scheduledAt: `${date}T${time}:00`, notes }, { onSuccess: () => setSuccess(`Aujourd'hui à ${time}`) })}>{m.isPending ? 'Création...' : 'Réserver le rendez-vous'}</button>
    </div>
  )
}

