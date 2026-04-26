import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { useCreatePatient } from '@/hooks/useSecretary'

export function SecretaryNewPatientPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [wilaya, setWilaya] = useState('Alger')
  const [dob, setDob] = useState('')
  const [notes, setNotes] = useState('')
  const create = useCreatePatient()
  const navigate = useNavigate()
  return <SecretaryLayout title="Nouveau patient"><div className="bg-white border rounded-xl p-4 grid grid-cols-2 gap-2"><input className="border rounded p-2" placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} /><input className="border rounded p-2" placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} /><input className="border rounded p-2 col-span-2" placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} /><input className="border rounded p-2 col-span-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><input className="border rounded p-2" placeholder="Wilaya" value={wilaya} onChange={(e) => setWilaya(e.target.value)} /><input type="date" className="border rounded p-2" value={dob} onChange={(e) => setDob(e.target.value)} /><textarea className="border rounded p-2 col-span-2" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} /><button className="col-span-2 h-10 rounded bg-[#1D9E75] text-white" onClick={() => create.mutate({ firstName, lastName, phone, email: email || null, wilaya, dob: dob || undefined, notes }, { onSuccess: (res) => navigate(`/secretary/patients/${String((res as { id: string }).id)}`) })}>Créer le patient</button></div></SecretaryLayout>
}

