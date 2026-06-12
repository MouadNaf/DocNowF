import api from '@/lib/api'
import type { SecretaryAppointment, SecretaryPatient } from '@/types/secretary'
import type { Treatment, TreatmentsPaginatedResponse, TreatmentPayment, SecretaryTreatmentStats } from '@/entities/treatment'

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
  const data = res.data.data ?? []
  
  return data.map((a: any) => ({
    id: a.id,
    status: a.status,
    payment_status: a.payment_status || 'unpaid',
    fee: Number(a.consultation_fee || 0),
    notes: a.notes || null,
    scheduled_at: a.scheduled_at,
    date: a.appointment_date || a.date,
    time: a.start_time || a.time,
    patient_id: a.patient_id,
    name: a.patient?.name || a.name || 'Patient inconnu',
    phone: a.patient?.phone || a.phone || '—',
    gender: a.patient?.gender || a.gender || null,
    arrived_at: a.arrived_at || null
  }))
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

export async function getWalkInSlots(date: string) {
  const res = await api.get('/appointments/walk-in-slots', { params: { date } })
  return res.data.data
}

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
  const data = res.data.data ?? []
  
  return data.map((p: any) => ({
    ...p,
    visits: p.totalVisits ?? p.visits ?? 0
  }))
}

// ─── Stubs (no backend endpoint yet) ─────────────────────────────────────────

export async function getWaitlist() { return [] }
export async function promoteWaitlist(_id: string, _slotTime: string) { return {} }
export async function removeFromWaitlist(_id: string) { return {} }
export async function notifyWaitlistPatient(_id: string) { return {} }
export async function rescheduleAppointment(id: string, datetime: string) {
  const [date, timeWithSecs] = datetime.split('T')
  const time = timeWithSecs.substring(0, 5)
  const res = await api.put(`/appointments/${id}/reschedule`, {
    appointment_date: date,
    start_time: time
  })
  return res.data
}
export async function createPatient(data: Record<string, unknown>) {
  const res = await api.post('/patients', data)
  return res.data.data
}

export async function searchPatientByPhone(phone: string) {
  const res = await api.get('/patients/search-by-phone', { params: { phone } })
  return res.data
}

// ─── Treatments ───────────────────────────────────────────────────────────────

const mapTreatment = (t: any): Treatment => ({
  id: String(t.id),
  patient_id: String(t.patient_id),
  doctor_id: String(t.doctor_id),
  title: t.title,
  description: t.description,
  diagnosis: t.diagnosis,
  status: t.status,
  total_cost: Number(t.total_cost || 0),
  paid_amount: Number(t.paid_amount || 0),
  remaining_balance: Number(t.remaining_balance ?? Math.max(0, (t.total_cost || 0) - (t.paid_amount || 0))),
  start_date: t.start_date,
  end_date: t.end_date,
  next_visit: t.next_visit,
  patient: t.patient,
  doctor: t.doctor,
  steps: t.steps?.map((s: any) => ({
    id: String(s.id),
    treatment_id: String(s.treatment_id),
    title: s.title,
    description: s.description,
    appointment_id: s.appointment_id ? String(s.appointment_id) : null,
    status: s.status,
    scheduled_date: s.scheduled_date,
    scheduled_time: s.scheduled_time,
    completed_at: s.completed_at,
    appointment: s.appointment,
  })),
  progress: t.progress,
  payments: t.payments?.map((p: any) => ({
    id: String(p.id),
    treatment_id: String(p.treatment_id),
    amount: Number(p.amount),
    payment_method: p.payment_method,
    notes: p.notes,
    recorded_by: p.recorded_by,
    created_at: p.created_at,
  })),
  created_at: t.created_at,
  updated_at: t.updated_at,
})

export async function getSecretaryTreatments(filters: {
  search?: string
  status?: string
  page?: number
  per_page?: number
  patient_id?: string
} = {}): Promise<TreatmentsPaginatedResponse> {
  const res = await api.get('/secretary/treatments', { params: filters })
  return {
    data: (res.data.data || []).map(mapTreatment),
    meta: res.data.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 },
  }
}

export async function getSecretaryTreatment(id: string): Promise<Treatment> {
  const res = await api.get(`/secretary/treatments/${id}`)
  return mapTreatment(res.data.data)
}

export async function getSecretaryTreatmentStats(): Promise<SecretaryTreatmentStats> {
  const res = await api.get('/secretary/treatments/stats')
  return res.data.data
}

export async function getPatientTreatments(patientId: string): Promise<Treatment[]> {
  const res = await api.get(`/secretary/patients/${patientId}/treatments`)
  return (res.data.data || []).map(mapTreatment)
}

export async function scheduleTreatmentVisit(
  treatmentId: string,
  payload: { date: string; time: string; notes?: string; title?: string },
) {
  const res = await api.post(`/secretary/treatments/${treatmentId}/schedule-appointment`, payload)
  return res.data
}

export async function rescheduleTreatmentVisit(
  treatmentId: string,
  stepId: string,
  payload: { date: string; time: string; notes?: string },
) {
  const res = await api.put(`/secretary/treatments/${treatmentId}/steps/${stepId}/reschedule`, payload)
  return res.data
}

export async function cancelTreatmentVisit(treatmentId: string, stepId: string) {
  const res = await api.post(`/secretary/treatments/${treatmentId}/steps/${stepId}/cancel`)
  return res.data
}

export async function getTreatmentPayments(treatmentId: string): Promise<TreatmentPayment[]> {
  const res = await api.get(`/secretary/treatments/${treatmentId}/payments`)
  return (res.data.data || []).map((p: any) => ({
    id: String(p.id),
    treatment_id: String(p.treatment_id),
    amount: Number(p.amount),
    payment_method: p.payment_method,
    notes: p.notes,
    recorded_by: p.recorded_by,
    created_at: p.created_at,
  }))
}

export async function recordTreatmentPayment(
  treatmentId: string,
  payload: { amount: number; payment_method: 'cash' | 'card' | 'bank_transfer'; notes?: string },
) {
  const res = await api.post(`/secretary/treatments/${treatmentId}/payments`, payload)
  return res.data.data
}
