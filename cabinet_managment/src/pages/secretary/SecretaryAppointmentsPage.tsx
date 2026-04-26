import { useMemo, useState } from 'react'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { useTodaySchedule } from '@/hooks/useSecretary'
import { formatDa } from '@/lib/mock/secretary.mock'
import { DailyExportButton } from '@/components/secretary/DailyExportButton'

export function SecretaryAppointmentsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [payment, setPayment] = useState('all')
  const { data = [] } = useTodaySchedule()
  const list = useMemo(() => {
    return data.filter((a) => {
      const textOk = !search || a.patientName.toLowerCase().includes(search.toLowerCase())
      const statusOk = status === 'all' || a.status === status
      const paymentOk = payment === 'all' || a.paymentStatus === payment
      return textOk && statusOk && paymentOk
    })
  }, [data, payment, search, status])
  const paidTotal = list.filter((a) => a.paymentStatus === 'paid').reduce((s, a) => s + a.fee, 0)
  const unpaidTotal = list.filter((a) => a.paymentStatus === 'unpaid' && a.status !== 'cancelled').reduce((s, a) => s + a.fee, 0)
  return (
    <SecretaryLayout title="Rendez-vous">
      <div className="bg-white border rounded-xl p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par nom..." className="h-10 border rounded-lg px-3 min-w-60" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 border rounded-lg px-3"><option value="all">Tous statuts</option><option value="confirmed">Confirmé</option><option value="arrived">Arrivé</option><option value="completed">Terminé</option><option value="cancelled">Annulé</option></select>
          <select value={payment} onChange={(e) => setPayment(e.target.value)} className="h-10 border rounded-lg px-3"><option value="all">Tous paiements</option><option value="paid">Payé</option><option value="unpaid">Non payé</option></select>
          <DailyExportButton rows={list.length} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px]"><thead><tr className="text-left text-xs text-gray-500"><th className="p-2">Date & Heure</th><th className="p-2">Patient</th><th className="p-2">Type</th><th className="p-2">Statut</th><th className="p-2">Paiement</th><th className="p-2">Montant</th></tr></thead><tbody>{list.map((a) => <tr key={a.id} className="border-t"><td className="p-2 text-sm">25/04/2026 {a.time}</td><td className="p-2 text-sm">{a.patientName}</td><td className="p-2 text-sm">{a.consultationTypeName}</td><td className="p-2 text-sm">{a.status}</td><td className="p-2 text-sm">{a.paymentStatus}</td><td className="p-2 text-sm"><span className="bg-gray-100 rounded px-2 py-1">{a.status === 'cancelled' ? '-' : formatDa(a.fee)}</span></td></tr>)}</tbody></table>
        </div>
        <div className="mt-3 text-sm text-gray-600">Total encaissé: {formatDa(paidTotal)} | Non payés: {formatDa(unpaidTotal)}</div>
      </div>
    </SecretaryLayout>
  )
}
