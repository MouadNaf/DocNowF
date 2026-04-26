export type SecretaryPaymentMethod = 'cash' | 'card' | 'ccp' | 'virement'
export type SecretaryAppointmentStatus =
  | 'confirmed'
  | 'arrived'
  | 'in_consultation'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface SecretaryAppointment {
  id: string
  patientName: string
  patientPhone: string
  patientId: string
  time: string
  endTime: string
  type: 'consultation' | 'follow_up' | 'teleconsultation' | 'walk_in'
  consultationTypeName: string
  fee: number
  basePrice?: number
  extrasPrice?: number
  extraItems?: Array<{ name: string; price: number }>
  status: SecretaryAppointmentStatus
  paymentStatus: 'paid' | 'unpaid'
  paymentMethod?: SecretaryPaymentMethod
  arrivedAt: string | null
  notes: string | null
}

export interface SecretaryPatient {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string | null
  wilaya: string
  dob?: string
  totalVisits: number
  lastVisit?: string
  createdAt: string
}

export interface SecretaryWaitlistItem {
  id: string
  patientName: string
  patientPhone: string
  requestedAt: string
  priority: number
  waitTime: string
  status: 'waiting'
}

export const formatDa = (amount: number) => `${amount.toLocaleString('fr-FR')} DA`

export const MOCK_SECRETARY = {
  id: 'sec_001',
  firstName: 'Amina',
  lastName: 'Khaldi',
  email: 'amina.khaldi@example.com',
  phone: '0771234567',
  role: 'secretary',
  status: 'active',
  assignedDoctor: {
    id: 'doc_001',
    firstName: 'Karim',
    lastName: 'Amrani',
    specialization: ['Cardiologie'],
    cabinetName: 'Cabinet Dr. Amrani — Cardiologie',
    consultationFee: 2500,
  },
}

export const MOCK_TODAY_APPOINTMENTS: SecretaryAppointment[] = [
  { id: 'apt_001', patientName: 'Mohamed Ait Benali', patientPhone: '0661234567', patientId: 'pat_001', time: '08:30', endTime: '09:00', type: 'consultation', consultationTypeName: 'Diagnostic simple', fee: 2000, status: 'completed', paymentStatus: 'paid', paymentMethod: 'cash', arrivedAt: '08:25', notes: null },
  { id: 'apt_002', patientName: 'Fatima Zahra Bensalem', patientPhone: '0551234567', patientId: 'pat_002', time: '09:00', endTime: '09:30', type: 'follow_up', consultationTypeName: 'Suivi cardiologique', fee: 1500, status: 'completed', paymentStatus: 'unpaid', arrivedAt: '08:55', notes: 'Patient needs prescription refill' },
  { id: 'apt_003', patientName: 'Ahmed Kaci', patientPhone: '0771234567', patientId: 'pat_003', time: '09:30', endTime: '10:15', type: 'consultation', consultationTypeName: 'Diagnostic + Échographie', fee: 3000, basePrice: 2000, extrasPrice: 1000, extraItems: [{ name: 'Échographie', price: 1000 }], status: 'in_consultation', paymentStatus: 'unpaid', arrivedAt: '09:20', notes: null },
  { id: 'apt_004', patientName: 'Lynda Ziani', patientPhone: '0661234568', patientId: 'pat_004', time: '10:30', endTime: '11:00', type: 'consultation', consultationTypeName: 'Diagnostic simple', fee: 2000, status: 'arrived', paymentStatus: 'unpaid', arrivedAt: '10:20', notes: null },
  { id: 'apt_005', patientName: 'Omar Ferhat', patientPhone: '0771234568', patientId: 'pat_005', time: '11:00', endTime: '11:30', type: 'consultation', consultationTypeName: 'Diagnostic simple', fee: 2000, status: 'confirmed', paymentStatus: 'unpaid', arrivedAt: null, notes: null },
  { id: 'apt_006', patientName: 'Nadia Mekki', patientPhone: '0551234568', patientId: 'pat_006', time: '11:30', endTime: '12:00', type: 'teleconsultation', consultationTypeName: 'Téléconsultation', fee: 1500, status: 'confirmed', paymentStatus: 'unpaid', arrivedAt: null, notes: null },
  { id: 'apt_007', patientName: 'Youcef Brahimi', patientPhone: '0661234569', patientId: 'pat_007', time: '14:00', endTime: '14:30', type: 'consultation', consultationTypeName: 'Diagnostic simple', fee: 2000, status: 'confirmed', paymentStatus: 'unpaid', arrivedAt: null, notes: null },
  { id: 'apt_008', patientName: 'Meriem Saidi', patientPhone: '0771234569', patientId: 'pat_008', time: '14:30', endTime: '15:00', type: 'walk_in', consultationTypeName: 'Diagnostic simple', fee: 2000, status: 'confirmed', paymentStatus: 'unpaid', arrivedAt: null, notes: null },
  { id: 'apt_009', patientName: 'Sofiane Ait', patientPhone: '0551234569', patientId: 'pat_009', time: '15:00', endTime: '15:30', type: 'consultation', consultationTypeName: 'Diagnostic simple', fee: 2000, status: 'cancelled', paymentStatus: 'unpaid', arrivedAt: null, notes: 'Patient called to cancel' },
]

export const MOCK_WAITLIST: SecretaryWaitlistItem[] = [
  { id: 'wait_001', patientName: 'Karima Bouzidi', patientPhone: '0661234570', requestedAt: new Date(Date.now() - 2 * 3600000).toISOString(), priority: 1, waitTime: '2h 15min', status: 'waiting' },
  { id: 'wait_002', patientName: 'Rachid Mansouri', patientPhone: '0771234570', requestedAt: new Date(Date.now() - 4 * 3600000).toISOString(), priority: 2, waitTime: '4h 05min', status: 'waiting' },
  { id: 'wait_003', patientName: 'Samira Hadj', patientPhone: '0551234570', requestedAt: new Date(Date.now() - 6 * 3600000).toISOString(), priority: 3, waitTime: '6h 30min', status: 'waiting' },
]

export const MOCK_PATIENTS: SecretaryPatient[] = [
  { id: 'pat_001', firstName: 'Mohamed', lastName: 'Ait Benali', phone: '0661234567', email: 'mohamed.ait@example.com', wilaya: 'Alger', dob: '1985-03-15', totalVisits: 8, lastVisit: '2026-04-24', createdAt: '2025-06-10' },
  { id: 'pat_002', firstName: 'Fatima Zahra', lastName: 'Bensalem', phone: '0551234567', email: null, wilaya: 'Alger', dob: '1972-08-22', totalVisits: 6, lastVisit: '2026-04-24', createdAt: '2025-08-15' },
  { id: 'pat_003', firstName: 'Ahmed', lastName: 'Kaci', phone: '0771234567', email: 'ahmed.kaci@example.com', wilaya: 'Blida', dob: '1990-11-05', totalVisits: 5, lastVisit: '2026-04-24', createdAt: '2025-09-20' },
]
