import { MOCK_PATIENTS, MOCK_TODAY_APPOINTMENTS, MOCK_WAITLIST } from '@/lib/mock/secretary.mock'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let appointmentsDb = [...MOCK_TODAY_APPOINTMENTS]
let waitlistDb = [...MOCK_WAITLIST]
let patientsDb = [...MOCK_PATIENTS]

export async function getTodaySchedule() {
  await delay(600)
  return appointmentsDb
  // REAL: return client.get('/secretary/today').then(r => r.data.data)
}

export async function markAsArrived(id: string) {
  await delay(500)
  appointmentsDb = appointmentsDb.map((a) => (a.id === id ? { ...a, status: 'arrived', arrivedAt: new Date().toISOString().slice(11, 16) } : a))
  return { id, status: 'arrived' }
  // REAL: return client.patch(`/appointments/${id}/arrived`)
}

export async function markAsPaid(id: string, data: { paymentMethod: 'cash' | 'card' | 'ccp' | 'virement'; notes?: string }) {
  await delay(700)
  appointmentsDb = appointmentsDb.map((a) => (a.id === id ? { ...a, paymentStatus: 'paid', paymentMethod: data.paymentMethod, notes: data.notes ?? a.notes } : a))
  return { id, paymentStatus: 'paid', paymentMethod: data.paymentMethod, paidAt: new Date().toISOString() }
  // REAL: return client.post(`/appointments/${id}/payment`, data)
}

export async function markAsNoShow(id: string) {
  await delay(500)
  appointmentsDb = appointmentsDb.map((a) => (a.id === id ? { ...a, status: 'no_show' } : a))
  return { id, status: 'no_show' }
  // REAL: return client.patch(`/appointments/${id}/no-show`)
}

export async function cancelAppointment(id: string, reason: string) {
  await delay(700)
  appointmentsDb = appointmentsDb.map((a) => (a.id === id ? { ...a, status: 'cancelled', notes: reason } : a))
  return { message: 'Appointment cancelled' }
  // REAL: return client.delete(`/appointments/${id}`, { data: { reason } })
}

export async function rescheduleAppointment(id: string, newDateTime: string) {
  await delay(800)
  appointmentsDb = appointmentsDb.map((a) => (a.id === id ? { ...a, time: newDateTime.slice(11, 16), endTime: newDateTime.slice(11, 16), status: 'confirmed' } : a))
  return { id, scheduledAt: newDateTime }
  // REAL: return client.patch(`/appointments/${id}/reschedule`, { scheduledAt: newDateTime })
}

export async function saveReceptionNote(id: string, note: string) {
  await delay(400)
  appointmentsDb = appointmentsDb.map((a) => (a.id === id ? { ...a, notes: note } : a))
  return { id, notes: note }
  // REAL: return client.patch(`/appointments/${id}/note`, { notes: note })
}

export async function createWalkIn(data: { patientId?: string; newPatient?: Record<string, unknown>; scheduledAt: string; notes?: string }) {
  await delay(900)
  const patientName = data.patientId
    ? (patientsDb.find((p) => p.id === data.patientId) ? `${patientsDb.find((p) => p.id === data.patientId)?.firstName} ${patientsDb.find((p) => p.id === data.patientId)?.lastName}` : 'Patient')
    : String(data.newPatient?.firstName ?? 'Nouveau')
  const patientPhone = data.patientId ? (patientsDb.find((p) => p.id === data.patientId)?.phone ?? 'N/A') : String(data.newPatient?.phone ?? 'N/A')
  const entry = {
    id: `apt_new_${Date.now()}`,
    patientName,
    patientPhone,
    patientId: data.patientId ?? `pat_new_${Date.now()}`,
    time: data.scheduledAt.slice(11, 16),
    endTime: data.scheduledAt.slice(11, 16),
    type: 'walk_in' as const,
    consultationTypeName: 'Diagnostic simple',
    fee: 2000,
    status: 'confirmed' as const,
    paymentStatus: 'unpaid' as const,
    arrivedAt: null,
    notes: data.notes ?? null,
  }
  appointmentsDb = [...appointmentsDb, entry]
  return entry
  // REAL: return client.post('/appointments', { ...data, type: 'walk_in' })
}

export async function getWaitlist() {
  await delay(500)
  return waitlistDb
  // REAL: return client.get('/waitlist').then(r => r.data.data)
}

export async function promoteWaitlist(id: string, slotTime: string) {
  await delay(700)
  waitlistDb = waitlistDb.filter((w) => w.id !== id)
  return { message: 'Patient promoted and notified', slotTime }
  // REAL: return client.patch(`/waitlist/${id}/promote`, { slotTime })
}

export async function removeFromWaitlist(id: string) {
  await delay(500)
  waitlistDb = waitlistDb.filter((w) => w.id !== id)
  return { message: 'Removed' }
  // REAL: return client.delete(`/waitlist/${id}`)
}

export async function notifyWaitlistPatient(id: string) {
  await delay(400)
  return { message: 'SMS sent', id }
  // REAL: return client.post(`/waitlist/${id}/notify`)
}

export async function getPatients(search?: string) {
  await delay(500)
  if (search) {
    return patientsDb.filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search))
  }
  return patientsDb
  // REAL: return client.get('/patients', { params: { search } }).then(r => r.data.data)
}

export async function createPatient(data: Record<string, unknown>) {
  await delay(800)
  const patient = {
    id: `pat_new_${Date.now()}`,
    ...data,
    totalVisits: 0,
    createdAt: new Date().toISOString(),
  }
  patientsDb = [...patientsDb, patient as (typeof patientsDb)[number]]
  return patient
  // REAL: return client.post('/patients', data).then(r => r.data.data)
}
