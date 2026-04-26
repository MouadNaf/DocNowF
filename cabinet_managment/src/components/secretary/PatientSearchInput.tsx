import { useMemo, useState } from 'react'
import { MOCK_PATIENTS } from '@/lib/mock/secretary.mock'

export function PatientSearchInput({ onPatientSelect, onNewPatient }: { onPatientSelect: (id: string) => void; onNewPatient: () => void }) {
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    if (q.length < 2) return []
    return MOCK_PATIENTS.filter((p) => (`${p.firstName} ${p.lastName}`).toLowerCase().includes(q.toLowerCase()) || p.phone.includes(q))
  }, [q])
  return (
    <div className="relative">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un patient..." className="h-10 w-full border rounded-lg px-3" />
      {q.length >= 2 && (
        <div className="absolute z-20 bg-white border rounded-lg mt-1 w-full max-h-56 overflow-auto">
          {list.map((p) => <button key={p.id} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" onClick={() => onPatientSelect(p.id)}>{p.firstName} {p.lastName} - {p.phone}</button>)}
          <button className="w-full text-left px-3 py-2 border-t text-[#1D9E75] text-sm" onClick={onNewPatient}>+ Nouveau patient</button>
        </div>
      )}
    </div>
  )
}

