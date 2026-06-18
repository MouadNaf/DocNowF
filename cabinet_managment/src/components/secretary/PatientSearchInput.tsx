import { useState } from 'react'
import { usePatients } from '@/hooks/useSecretary'

export function PatientSearchInput({ onPatientSelect, onNewPatient }: { onPatientSelect: (id: string) => void; onNewPatient: () => void }) {
  const [q, setQ] = useState('')
  const { data: patients = [], isLoading } = usePatients(q.length >= 2 ? q : undefined)

  return (
    <div className="relative">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un patient..." className="h-10 w-full border rounded-lg px-3" />
      {q.length >= 2 && (
        <div className="absolute z-20 bg-white border rounded-lg mt-1 w-full max-h-56 overflow-auto">
          {isLoading && (
            <p className="px-3 py-2 text-sm text-gray-400">Recherche...</p>
          )}
          {!isLoading && patients.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-400">Aucun patient trouvé</p>
          )}
          {patients.map((p) => (
            <button
              key={p.id}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
              onClick={() => onPatientSelect(String(p.id))}
            >
              {p.name ?? 'Patient'} — {p.phone ?? '—'}
            </button>
          ))}
          <button className="w-full text-left px-3 py-2 border-t text-[#1D9E75] text-sm" onClick={onNewPatient}>+ Nouveau patient</button>
        </div>
      )}
    </div>
  )
}
