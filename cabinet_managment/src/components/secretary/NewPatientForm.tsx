import { useState } from 'react'

export function NewPatientForm({ onCreate }: { onCreate: (data: { firstName: string; lastName: string; phone: string; wilaya: string }) => void }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [wilaya, setWilaya] = useState('Alger')
  return (
    <div className="grid grid-cols-2 gap-2">
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="border rounded-lg p-2" placeholder="Prénom" />
      <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="border rounded-lg p-2" placeholder="Nom" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} className="border rounded-lg p-2 col-span-2" placeholder="Téléphone" />
      <input value={wilaya} onChange={(e) => setWilaya(e.target.value)} className="border rounded-lg p-2 col-span-2" placeholder="Wilaya" />
      <button className="col-span-2 h-10 rounded-lg bg-[#1D9E75] text-white" onClick={() => onCreate({ firstName, lastName, phone, wilaya })}>Créer et continuer</button>
    </div>
  )
}

