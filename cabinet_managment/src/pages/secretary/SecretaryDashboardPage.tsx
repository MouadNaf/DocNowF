import { useState } from 'react'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import {
  useTodaySchedule,
  useCancelAppointment,
  useMarkAsArrived,
  useMarkAsNoShow,
  useMarkAsPaid,
  useSaveNote,
} from '@/hooks/useSecretary'
import type { SecretaryAppointment } from '@/types/secretary'

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmé',
  arrived: 'Arrivé',
  no_show: 'Absent',
  cancelled: 'Annulé',
  completed: 'Terminé',
  pending: 'En attente',
}
const STATUS_COLOR: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  arrived: 'bg-indigo-100 text-indigo-700',
  no_show: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
}

export function SecretaryDashboardPage() {
  const { data: appointments = [], isLoading } = useTodaySchedule()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [modal, setModal] = useState<'cancel' | 'pay' | 'note' | null>(null)

  const confirmed = appointments.filter((a) => a.status === 'confirmed').length
  const arrived = appointments.filter((a) => a.status === 'arrived').length
  const completed = appointments.filter((a) => a.status === 'completed').length
  const cancelled = appointments.filter((a) => a.status === 'cancelled').length

  const selectedApt = appointments.find(a => a.id === selectedId)

  return (
    <SecretaryLayout title="Tableau de bord">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total aujourd'hui" value={appointments.length} color="bg-white border text-gray-800" />
        <StatCard label="Confirmés" value={confirmed} color="bg-blue-50 text-blue-700" />
        <StatCard label="Arrivés" value={arrived} color="bg-indigo-50 text-indigo-700" />
        <StatCard label="Annulés" value={cancelled} color="bg-red-50 text-red-600" />
      </div>

      {/* Schedule Table */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            Planning du jour — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <div className="flex gap-2">
             <span className="text-xs text-gray-400 italic">Mise à jour automatique</span>
          </div>
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-sm py-12 text-center">Chargement du planning...</p>
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed rounded-lg">
             <p className="text-gray-400 text-sm">Aucun rendez-vous pour aujourd'hui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b">
                  <th className="py-3 px-3">Heure</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-3">Paiement</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {appointments.map((a) => (
                  <AppointmentRow
                    key={a.id}
                    a={a}
                    onAction={(type) => {
                      setSelectedId(a.id)
                      if (type === 'cancel' || type === 'pay' || type === 'note') {
                        setModal(type)
                      }
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'cancel' && selectedId && (
        <CancelDialog id={selectedId} onClose={() => setModal(null)} />
      )}
      {modal === 'pay' && selectedApt && (
        <PayDialog apt={selectedApt} onClose={() => setModal(null)} />
      )}
      {modal === 'note' && selectedApt && (
        <NoteDialog apt={selectedApt} onClose={() => setModal(null)} />
      )}
    </SecretaryLayout>
  )
}

function AppointmentRow({ a, onAction }: { a: SecretaryAppointment; onAction: (type: string) => void }) {
  const arrived = useMarkAsArrived()
  const noshow = useMarkAsNoShow()

  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="py-4 px-3 font-semibold text-gray-700">{a.time}</td>
      <td className="py-4 px-3">
        <div className="flex flex-col">
           <span className="font-medium text-gray-900">{a.name ?? '—'}</span>
           <span className="text-xs text-gray-500">{a.phone ?? '—'}</span>
        </div>
      </td>
      <td className="py-4 px-3">
        <span className={`text-[10px] uppercase px-2 py-1 rounded-full font-bold tracking-tight ${STATUS_COLOR[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABEL[a.status] ?? a.status}
        </span>
        {a.arrived_at && (
           <p className="text-[10px] text-gray-400 mt-1">Arrivé à {new Date(a.arrived_at).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</p>
        )}
      </td>
      <td className="py-4 px-3">
        {a.payment_status === 'paid' ? (
           <div className="flex items-center gap-1 text-green-600 font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Payé
           </div>
        ) : (
           <div className="flex items-center gap-1 text-red-500 font-medium">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
              Non payé
           </div>
        )}
      </td>
      <td className="py-4 px-3 text-right">
        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          {a.status === 'confirmed' && (
            <>
              <button 
                onClick={() => arrived.mutate(a.id)}
                className="h-8 px-3 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100"
              >
                Arrivé
              </button>
              <button 
                onClick={() => noshow.mutate(a.id)}
                className="h-8 px-3 rounded-lg bg-orange-50 text-orange-600 text-xs font-semibold hover:bg-orange-100"
              >
                Absent
              </button>
            </>
          )}
          {a.payment_status !== 'paid' && a.status !== 'cancelled' && (
            <button 
              onClick={() => onAction('pay')}
              className="h-8 px-3 rounded-lg bg-green-50 text-green-600 text-xs font-semibold hover:bg-green-100"
            >
              Payer
            </button>
          )}
          <button 
            onClick={() => onAction('note')}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
            title="Note"
          >
            📝
          </button>
          {a.status !== 'cancelled' && a.status !== 'completed' && (
            <button
              onClick={() => onAction('cancel')}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
              title="Annuler"
            >
              ✕
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl p-4 shadow-sm ${color}`}>
      <p className="text-3xl font-black">{value}</p>
      <p className="text-xs mt-1 font-medium opacity-70 uppercase tracking-wide">{label}</p>
    </div>
  )
}

function CancelDialog({ id, onClose }: { id: number; onClose: () => void }) {
  const cancel = useCancelAppointment()
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-[400px] shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Annuler le rendez-vous</h3>
        <p className="text-sm text-gray-500 mb-4">Cette action est irréversible. Le patient recevra une notification.</p>
        <textarea
          className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm mb-4 h-24 focus:border-red-200 focus:outline-none transition-colors"
          placeholder="Pourquoi annulez-vous ? (ex: Patient absent, Urgent...)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 text-sm font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">Retour</button>
          <button
            onClick={() => cancel.mutate({ id, reason }, { onSuccess: onClose })}
            disabled={cancel.isPending}
            className="flex-1 h-11 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 transition-all disabled:opacity-50"
          >
            {cancel.isPending ? 'Annulation...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PayDialog({ apt, onClose }: { apt: SecretaryAppointment; onClose: () => void }) {
  const pay = useMarkAsPaid()
  const [method, setMethod] = useState('cash')
  const [amount, setAmount] = useState(apt.fee.toString())
  const [note, setNote] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-[400px] shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Enregistrer le paiement</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Montant (DA)</label>
            <input 
               type="number"
               className="w-full h-11 border-2 border-gray-50 rounded-xl px-4 font-bold text-lg focus:border-green-200 focus:outline-none"
               value={amount}
               onChange={e => setAmount(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mode de paiement</label>
            <div className="grid grid-cols-2 gap-2">
              {['cash', 'card', 'ccp', 'virement'].map(m => (
                <button 
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`h-10 rounded-lg text-xs font-bold border-2 transition-all ${method === m ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-50 text-gray-400'}`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 text-sm font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">Annuler</button>
          <button
            onClick={() => pay.mutate({ id: apt.id, data: { paymentMethod: method, amount: Number(amount), notes: note } }, { onSuccess: onClose })}
            disabled={pay.isPending}
            className="flex-1 h-11 text-sm font-bold bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-lg shadow-green-200 transition-all disabled:opacity-50"
          >
            {pay.isPending ? 'Traitement...' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  )
}

function NoteDialog({ apt, onClose }: { apt: SecretaryAppointment; onClose: () => void }) {
  const save = useSaveNote()
  const [note, setNote] = useState(apt.notes ?? '')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-[400px] shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Note de réception</h3>
        <textarea
          className="w-full border-2 border-gray-50 rounded-xl p-4 text-sm mb-6 h-32 focus:border-blue-200 focus:outline-none transition-colors"
          placeholder="Infos importantes sur l'arrivée du patient..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 text-sm font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">Annuler</button>
          <button
            onClick={() => save.mutate({ id: apt.id, note }, { onSuccess: onClose })}
            disabled={save.isPending}
            className="flex-1 h-11 text-sm font-bold bg-[#1D9E75] text-white rounded-xl hover:opacity-90 shadow-lg shadow-green-100 transition-all disabled:opacity-50"
          >
            {save.isPending ? 'Enregistrement...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
