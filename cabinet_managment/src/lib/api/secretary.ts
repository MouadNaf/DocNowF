import api from '@/lib/api'
import type { SecretaryAppointment, SecretaryPatient } from '@/types/secretary'

// ─── Appointments ────────────────────────────────────────────────────────────

export interface AppointmentFilters {
  doctor_id: string
  date?: string
  patient?: string
  status?: string
}

export async function getAppointments(filters: AppointmentFilters): Promise<SecretaryAppointment[]> {
  const params: Record<string, string> = { doctor_id: filters.doctor_id }
  if (filters.date)    params.date    = filters.date
  if (filters.patient) params.patient = filters.patient
  if (filters.status)  params.status  = filters.status
  const res = await api.get('/appointments', { params })
  return res.data.data ?? []
}

export async function getTodaySchedule(doctor_id: string): Promise<SecretaryAppointment[]> {
  const today = new Date().toISOString().slice(0, 10)
  return getAppointments({ doctor_id, date: today })
}

export async function cancelAppointment(id: number, reason: string): Promise<void> {
  await api.patch(`/appointments/${id}/status`, { status: 'cancelled', reason })
}

export async function markAsArrived(id: number) {
  const res = await api.patch(`/appointments/${id}/status`, { status: 'arrived' })
  return res.data.data
}

export async function markAsNoShow(id: number) {
  const res = await api.patch(`/appointments/${id}/status`, { status: 'no_show' })
  return res.data.data
}

export async function saveReceptionNote(id: number, note: string) {
  const res = await api.patch(`/appointments/${id}/note`, { notes: note })
  return res.data.data
}

export async function markAsPaid(id: number, data: { paymentMethod: string; amount?: number; notes?: string }) {
  const res = await api.post(`/appointments/${id}/payment`, {
    payment_method: data.paymentMethod,
    amount: data.amount,
    notes: data.notes
  })
  return res.data.data
}

// ─── Walk-In ─────────────────────────────────────────────────────────────────

export interface WalkInPayload {
  doctor_id: string
  name: string
  phone: string
  email?: string
  gender?: string
  city?: string
}

export async function createWalkIn(payload: WalkInPayload) {
  const res = await api.post('/appointments/walk-in', payload)
  return res.data.data
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export async function getPatients(doctor_id: string, search?: string): Promise<SecretaryPatient[]> {
  const params: Record<string, string> = { doctor_id }
  if (search) params.search = search
  const res = await api.get('/patients', { params })
  return res.data.data ?? []
}

// ─── Stubs (no backend endpoint yet) ─────────────────────────────────────────

export async function getWaitlist() { return [] }
export async function promoteWaitlist(_id: string, _slotTime: string) { return {} }
export async function removeFromWaitlist(_id: string) { return {} }
export async function notifyWaitlistPatient(_id: string) { return {} }
export async function rescheduleAppointment(_id: string, _dt: string) { return {} }
export async function createPatient(data: Record<string, unknown>) {
  const res = await api.post('/patients', data)
  return res.data.data
}

export async function searchPatientByPhone(phone: string) {
  const res = await api.get('/patients/search-by-phone', { params: { phone } })
  return res.data
}
