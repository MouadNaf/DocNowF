import { useState } from 'react'
import { saveReceptionNote } from '@/lib/api/secretary'

export function ReceptionNoteModal({ id, note, onClose }: { id: string; note?: string | null; onClose: () => void }) {
  const [value, setValue] = useState(note ?? '')
  const [loading, setLoading] = useState(false)
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-2">Notes de reception</h3>
        <p className="text-xs text-emerald-700 bg-[#E8F7F1] rounded p-2 mb-2">Cette note est visible par le medecin.</p>
        <textarea className="w-full border rounded-lg p-2 text-sm h-28" value={value} onChange={(e) => setValue(e.target.value)} />
        <button className="mt-3 w-full h-10 rounded bg-[#1D9E75] text-white" disabled={loading} onClick={async () => { setLoading(true); await saveReceptionNote(id, value); setLoading(false); onClose(); }}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}

