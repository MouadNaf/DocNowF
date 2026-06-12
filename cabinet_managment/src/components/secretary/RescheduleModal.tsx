import { useState } from 'react'
import { useRescheduleAppointment } from '@/hooks/useSecretary'
import type { Appointment } from '@/types/secretary.types'

type Props = { id?: string; appointment?: Appointment; onClose: () => void }

export function RescheduleModal({ id, appointment, onClose }: Props) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('10:30')
  const reschedule = useRescheduleAppointment()

  const submit = async () => {
    const targetId = id ?? appointment?.id
    if (!targetId) return
    reschedule.mutate({ id: targetId.toString(), datetime: `${date}T${time}:00` }, {
      onSuccess: () => onClose()
    })
  }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-3">Reporter le rendez-vous</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <input type="date" className="border rounded-lg p-2" value={date} onChange={(e) => setDate(e.target.value)} />
          <input type="time" className="border rounded-lg p-2" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <button 
          className="w-full h-10 bg-[#1D9E75] text-white rounded-lg disabled:opacity-50" 
          onClick={submit} 
          disabled={reschedule.isPending}
        >
          {reschedule.isPending ? 'Chargement...' : 'Confirmer le report'}
        </button>
      </div>
    </div>
  )
}

