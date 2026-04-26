import { useMarkAsNoShow } from '@/hooks/useSecretary'

export function MarkNoShowModal({ id, onClose }: { id: string; onClose: () => void }) {
  const m = useMarkAsNoShow()
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-2">Marquer absent ?</h3>
        <p className="text-xs text-red-600 mb-3">Cette action est irreversible.</p>
        <button className="w-full h-10 rounded-lg border border-red-300 text-red-600" onClick={() => m.mutate(id, { onSuccess: onClose })}>
          Confirmer absent
        </button>
      </div>
    </div>
  )
}
