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
  return (
    <SecretaryLayout title="Nouveau patient">
      <div className="bg-white rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Informations du patient</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
            <input className="w-full bg-gray-50 text-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/20 transition-all placeholder:text-gray-400" placeholder="Ex: Jean" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
            <input className="w-full bg-gray-50 text-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/20 transition-all placeholder:text-gray-400" placeholder="Ex: Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
            <input className="w-full bg-gray-50 text-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/20 transition-all placeholder:text-gray-400" placeholder="Ex: 05 55 55 55 55" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input className="w-full bg-gray-50 text-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/20 transition-all placeholder:text-gray-400" placeholder="Ex: jean.dupont@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Wilaya</label>
            <input className="w-full bg-gray-50 text-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/20 transition-all placeholder:text-gray-400" placeholder="Ex: Alger" value={wilaya} onChange={(e) => setWilaya(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de naissance</label>
            <input type="date" className="w-full bg-gray-50 text-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/20 transition-all" value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes ou antécédents</label>
            <textarea className="w-full bg-gray-50 text-gray-700 rounded-xl px-4 py-3 text-sm h-32 resize-none outline-none focus:ring-2 focus:ring-[#1D9E75]/20 transition-all placeholder:text-gray-400" placeholder="Notes optionnelles..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button 
            className="px-8 py-3 rounded-xl bg-[#1D9E75] hover:bg-[#168260] text-white font-medium transition-all shadow-sm shadow-[#1D9E75]/20 w-full md:w-auto" 
            onClick={() => create.mutate({ firstName, lastName, phone, email: email || null, wilaya, dob: dob || undefined, notes }, { onSuccess: (res) => navigate(`/secretary/patients/${String((res as { id: string }).id)}`) })}
          >
            Créer le patient
          </button>
        </div>
      </div>
    </SecretaryLayout>
  )
}

