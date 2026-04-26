import { useState } from 'react'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { useTodaySchedule, useWaitlist } from '@/hooks/useSecretary'
import { AppointmentRowSecretary } from '@/components/secretary/AppointmentRowSecretary'
import { DailyExportButton } from '@/components/secretary/DailyExportButton'
import { MarkPaidModal } from '@/components/secretary/MarkPaidModal'
import { CancelModal } from '@/components/secretary/CancelModal'
import { RescheduleModal } from '@/components/secretary/RescheduleModal'
import { MarkNoShowModal } from '@/components/secretary/MarkNoShowModal'
import { ReceptionNoteModal } from '@/components/secretary/ReceptionNoteModal'
import { WaitlistItemSecretary } from '@/components/secretary/WaitlistItemSecretary'
import { PromoteModal } from '@/components/secretary/PromoteModal'
import { formatDa } from '@/lib/mock/secretary.mock'
import { useNotifyWaitlistPatient, useRemoveFromWaitlist } from '@/hooks/useSecretary'

export function SecretaryDashboardPage() {
  const { data: appointments = [] } = useTodaySchedule()
  const { data: waitlist = [] } = useWaitlist()
  const notify = useNotifyWaitlistPatient()
  const remove = useRemoveFromWaitlist()
  const [selected, setSelected] = useState<string | null>(null)
  const [modal, setModal] = useState<'pay' | 'cancel' | 'reschedule' | 'noshow' | 'note' | null>(null)
  const [promoteId, setPromoteId] = useState<string | null>(null)
  const current = appointments.find((a) => a.id === selected)
  const arrived = appointments.filter((a) => a.status === 'arrived' || a.arrivedAt).length
  const unpaid = appointments.filter((a) => a.paymentStatus === 'unpaid').length
  const remaining = appointments.filter((a) => ['confirmed', 'arrived', 'in_consultation'].includes(a.status)).length
  const collected = appointments.filter((a) => a.paymentStatus === 'paid').reduce((sum, a) => sum + a.fee, 0)
  return (
    <SecretaryLayout title="Tableau de bord">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
        <Card label="Rendez-vous aujourd'hui" value={appointments.length} />
        <Card label="Arrivés" value={arrived} />
        <Card label="Non payés" value={unpaid} />
        <Card label="Restants" value={remaining} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 bg-white rounded-xl border p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Planning du jour</h2>
            <DailyExportButton rows={appointments.length} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead><tr className="text-left text-xs text-gray-500"><th className="p-2">Heure</th><th className="p-2">Patient</th><th className="p-2">Type</th><th className="p-2">Statut</th><th className="p-2">Prix</th><th className="p-2">Actions</th></tr></thead>
              <tbody>
                {appointments.map((a) => (
                  <AppointmentRowSecretary key={a.id} appointment={a} onPay={() => { setSelected(a.id); setModal('pay') }} onCancel={() => { setSelected(a.id); setModal('cancel') }} onNoShow={() => { setSelected(a.id); setModal('noshow') }} onReschedule={() => { setSelected(a.id); setModal('reschedule') }} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="xl:col-span-2 space-y-3">
          <div className="bg-white rounded-xl border p-3">
            <h3 className="font-semibold mb-2">File d'attente ({waitlist.length})</h3>
            <div className="space-y-2">
              {waitlist.map((w) => <WaitlistItemSecretary key={w.id} item={w} onPromote={() => setPromoteId(w.id)} onNotify={() => notify.mutate(w.id)} onRemove={() => remove.mutate(w.id)} />)}
            </div>
          </div>
          <div className="bg-white rounded-xl border p-3 text-sm">
            <p>Consultations terminées: {appointments.filter((a) => a.status === 'completed').length}</p>
            <p>Total encaissé: {formatDa(collected)}</p>
            <p>Non payés: {unpaid}</p>
          </div>
        </div>
      </div>
      {modal === 'pay' && current && <MarkPaidModal appointment={current} onClose={() => setModal(null)} />}
      {modal === 'cancel' && current && <CancelModal id={current.id} onClose={() => setModal(null)} />}
      {modal === 'reschedule' && current && <RescheduleModal id={current.id} onClose={() => setModal(null)} />}
      {modal === 'noshow' && current && <MarkNoShowModal id={current.id} onClose={() => setModal(null)} />}
      {modal === 'note' && current && <ReceptionNoteModal id={current.id} note={current.notes} onClose={() => setModal(null)} />}
      {promoteId && <PromoteModal id={promoteId} onClose={() => setPromoteId(null)} />}
    </SecretaryLayout>
  )
}

function Card({ label, value }: { label: string; value: number }) {
  return <div className="bg-white border rounded-xl p-4"><p className="text-2xl font-bold">{value}</p><p className="text-sm text-gray-600">{label}</p></div>
}
