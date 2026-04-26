import { useState } from 'react'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { useNotifyWaitlistPatient, useRemoveFromWaitlist, useWaitlist } from '@/hooks/useSecretary'
import { WaitlistItemSecretary } from '@/components/secretary/WaitlistItemSecretary'
import { PromoteModal } from '@/components/secretary/PromoteModal'

export function SecretaryWaitingListPage() {
  const { data = [] } = useWaitlist()
  const notify = useNotifyWaitlistPatient()
  const remove = useRemoveFromWaitlist()
  const [promoteId, setPromoteId] = useState<string | null>(null)
  return (
    <SecretaryLayout title="File d'attente">
      <div className="bg-white border rounded-xl p-4">
        {!data.length && <p className="text-sm text-gray-500">Aucun patient en attente</p>}
        <div className="space-y-2">{data.map((w) => <WaitlistItemSecretary key={w.id} item={w} onPromote={() => setPromoteId(w.id)} onNotify={() => notify.mutate(w.id)} onRemove={() => remove.mutate(w.id)} />)}</div>
      </div>
      {promoteId && <PromoteModal id={promoteId} onClose={() => setPromoteId(null)} />}
    </SecretaryLayout>
  )
}
