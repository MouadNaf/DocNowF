import { formatDa, type SecretaryAppointment } from '@/lib/mock/secretary.mock'
import { MarkArrivedButton } from './MarkArrivedButton'

export function AppointmentRowSecretary({ appointment, onPay, onCancel, onNoShow, onReschedule }: { appointment: SecretaryAppointment; onPay: () => void; onCancel: () => void; onNoShow: () => void; onReschedule: () => void }) {
  return (
    <tr className={appointment.status === 'arrived' ? 'bg-[#E8F7F1]' : appointment.status === 'in_consultation' ? 'bg-[#E6F1FB]' : appointment.status === 'completed' ? 'bg-[#F9FAFB]' : ''}>
      <td className="p-2 text-sm">{appointment.time}</td>
      <td className="p-2 text-sm">{appointment.patientName}</td>
      <td className="p-2 text-sm">{appointment.consultationTypeName}</td>
      <td className="p-2 text-sm">{appointment.status}</td>
      <td className="p-2 text-sm"><span className="bg-gray-100 rounded px-2 py-1">{appointment.status === 'cancelled' ? '-' : formatDa(appointment.fee)}</span></td>
      <td className="p-2"><div className="flex items-center gap-1">{appointment.status === 'confirmed' && <MarkArrivedButton id={appointment.id} />} {(appointment.status === 'arrived' || (appointment.status === 'completed' && appointment.paymentStatus === 'unpaid')) && <button onClick={onPay} className="h-8 px-2 rounded bg-green-600 text-white text-xs">Encaisser</button>} {appointment.status === 'confirmed' && <button onClick={onReschedule} className="h-8 px-2 rounded border text-xs">Reporter</button>} {appointment.status !== 'cancelled' && <button onClick={onCancel} className="h-8 px-2 rounded border border-red-200 text-red-600 text-xs">Annuler</button>} {(appointment.status === 'arrived' || appointment.status === 'confirmed') && <button onClick={onNoShow} className="h-8 px-2 rounded border text-xs">Absent</button>}</div></td>
    </tr>
  )
}

