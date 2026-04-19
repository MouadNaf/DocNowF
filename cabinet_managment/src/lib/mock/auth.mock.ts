import type { AuthUser, InviteValidation, LoginCredentials } from '@/types/auth'

const wait = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms))

type LoginResult = { user: AuthUser; token: string }

const users: Record<string, AuthUser> = {
  'doctor@test.com': {
    id: '1',
    firstName: 'Amine',
    lastName: 'Doctor',
    email: 'doctor@test.com',
    role: 'doctor',
    doctorType: 'doctor_only',
    status: 'active',
  },
  'cabinet@test.com': {
    id: '2',
    firstName: 'Lina',
    lastName: 'Cabinet',
    email: 'cabinet@test.com',
    role: 'doctor',
    doctorType: 'private_cabinet',
    status: 'active',
  },
  'clinic@test.com': {
    id: '3',
    firstName: 'Nora',
    lastName: 'Clinic',
    email: 'clinic@test.com',
    role: 'clinic_admin',
    status: 'active',
  },
  'cabinetadmin@test.com': {
    id: '4',
    firstName: 'Yacine',
    lastName: 'CabAdmin',
    email: 'cabinetadmin@test.com',
    role: 'cabinet_admin',
    status: 'active',
  },
  'admin@test.com': {
    id: '5',
    firstName: 'Sara',
    lastName: 'Admin',
    email: 'admin@test.com',
    role: 'platform_admin',
    status: 'active',
  },
  // ── Secretary account ──────────────────────────────────────────────────────
  'secretary@test.com': {
    id: '6',
    firstName: 'Samira',
    lastName: 'Sekretaria',
    email: 'secretary@test.com',
    role: 'secretary',
    status: 'active',
  },
  'pending@test.com': {
    id: '7',
    firstName: 'Pending',
    lastName: 'User',
    email: 'pending@test.com',
    role: 'doctor',
    status: 'pending_approval',
  },
}

export async function mockLogin(credentials: LoginCredentials): Promise<LoginResult> {
  await wait()
  if (credentials.password !== 'Test1234' || !users[credentials.email]) {
    throw new Error('Invalid email or password')
  }
  return { user: users[credentials.email], token: `mock-token-${Date.now()}` }
}

/** Document field keys expected per registration role (admin / pending queue parity) */
export const mockPendingRegistrationsDocuments = {
  doctor: ['medical_license', 'national_id'] as const,
  clinic: ['clinic_registration', 'admin_national_id'] as const,
  cabinet: ['cabinet_registration', 'admin_national_id'] as const,
} as const

export async function mockRegisterDoctor(_: unknown) {
  await wait()
  return { message: 'Doctor account created', nextStep: 'pending' as const }
}

export async function mockRegisterClinic(_: unknown) {
  await wait()
  return { message: 'Clinic registration submitted', nextStep: 'pending' as const }
}

export async function mockRegisterCabinet(_: unknown) {
  await wait()
  return { message: 'Cabinet registration submitted', nextStep: 'pending' as const }
}

export async function mockCreatePrivateCabinet(_: unknown) {
  await wait()
  return { message: 'Private cabinet created', nextStep: 'pending' as const }
}

export async function mockValidateInviteCode(code: string): Promise<InviteValidation> {
  await wait()
  const map: Record<string, InviteValidation> = {
    'CLINIC-2026-SHIFA': {
      orgName: 'Clinique El Shifa',
      orgType: 'clinic',
      wilaya: 'Oran',
    },
    'CLINIC-2026-NOUR': {
      orgName: 'Clinique Nour',
      orgType: 'clinic',
      wilaya: 'Alger',
    },
    'CAB-2026-AMIRA': {
      orgName: 'Cabinet Amira',
      orgType: 'cabinet_collectif',
      wilaya: 'Alger',
    },
  }
  const result = map[code]
  if (!result) throw new Error('Invalid or expired code')
  return result
}

export async function mockForgotPassword(_: string) {
  await wait()
  return { message: 'If account exists, email sent' }
}

export async function mockResetPassword(_: string, __: string) {
  await wait()
  return { message: 'Password reset' }
}

export async function mockVerifyOTP(code: string) {
  await wait()
  if (code === '000000') throw new Error('Incorrect code. Please try again.')
  return { message: 'Verified' }
}

import type { User } from '@/entities/user'
import type { Patient } from '@/entities/patient'
import type { Appointment } from '@/entities/appointment'
import type { Schedule } from '@/entities/schedule'

export const mockUsers: User[] = Object.values(users).map(u => ({
  id: u.id,
  name: `${u.firstName} ${u.lastName}`,
  email: u.email,
  role: u.role as 'doctor' | 'secretary'
}))

export const mockPatients: Patient[] = [
  { id: 'p1', name: 'Ahlam Benali', phone: '0555123456', totalVisits: 3, lastVisit: '2023-10-12' },
  { id: 'p2', name: 'Karim Brahimi', phone: '0666987654', totalVisits: 1, lastVisit: '2023-11-01' },
  { id: 'p3', name: 'Yassine Mansouri', phone: '0777112233', totalVisits: 5, lastVisit: '2023-10-25' },
  { id: 'p4', name: 'Fatima Zohra', phone: '0555443322', totalVisits: 0, lastVisit: '' },
  { id: 'p5', name: 'Omar Khelil', phone: '0666554433', totalVisits: 2, lastVisit: '2023-09-15' },
  { id: 'p6', name: 'Nadia Saidi', phone: '0777665544', totalVisits: 4, lastVisit: '2023-10-30' },
  { id: 'p7', name: 'Ali Belkacem', phone: '0555778899', totalVisits: 1, lastVisit: '2023-11-02' },
  { id: 'p8', name: 'Samira Toumi', phone: '0666112233', totalVisits: 6, lastVisit: '2023-10-05' },
  { id: 'p9', name: 'Hassan Cherif', phone: '0777998877', totalVisits: 2, lastVisit: '2023-10-20' },
  { id: 'p10', name: 'Meriem Haddad', phone: '0555223344', totalVisits: 3, lastVisit: '2023-10-28' },
];

export const mockAppointments: Appointment[] = [
  { id: 'a1', patientId: 'p1', doctorId: '1', date: '2023-11-10', time: '09:00', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'follow_up', consultationFee: 2000 },
  { id: 'a2', patientId: 'p2', doctorId: '1', date: '2023-11-10', time: '09:30', status: 'arrived', paymentStatus: 'paid', visitType: 'first_time', consultationFee: 2500, paidAt: '2023-11-10T09:25:00Z' },
  { id: 'a3', patientId: 'p3', doctorId: '1', date: '2023-11-10', time: '10:00', status: 'completed', paymentStatus: 'paid', visitType: 'follow_up', consultationFee: 2000, paidAt: '2023-11-10T10:30:00Z' },
  { id: 'a4', patientId: 'p4', doctorId: '1', date: '2023-11-10', time: '10:30', status: 'no_show', paymentStatus: 'unpaid', visitType: 'first_time', consultationFee: 2500 },
  { id: 'a5', patientId: 'p5', doctorId: '1', date: '2023-11-10', time: '11:00', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'follow_up', consultationFee: 2000 },
  { id: 'a6', patientId: 'p6', doctorId: '1', date: '2023-11-10', time: '13:00', status: 'confirmed', paymentStatus: 'paid', visitType: 'follow_up', consultationFee: 2000, paidAt: '2023-11-09T14:00:00Z' },
  { id: 'a7', patientId: 'p7', doctorId: '1', date: '2023-11-11', time: '09:00', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'first_time', consultationFee: 2500 },
  { id: 'a8', patientId: 'p8', doctorId: '1', date: '2023-11-11', time: '09:30', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'follow_up', consultationFee: 2000 },
  { id: 'a9', patientId: 'p9', doctorId: '1', date: '2023-11-11', time: '10:00', status: 'confirmed', paymentStatus: 'paid', visitType: 'follow_up', consultationFee: 2000, paidAt: '2023-11-05T10:00:00Z' },
  { id: 'a10', patientId: 'p10', doctorId: '1', date: '2023-11-11', time: '10:30', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'follow_up', consultationFee: 2000 },
  { id: 'a11', patientId: 'p1', doctorId: '1', date: '2023-11-12', time: '09:00', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'follow_up', consultationFee: 2000 },
  { id: 'a12', patientId: 'p2', doctorId: '1', date: '2023-11-12', time: '09:30', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'follow_up', consultationFee: 2000 },
  { id: 'a13', patientId: 'p3', doctorId: '1', date: '2023-11-12', time: '10:00', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'follow_up', consultationFee: 2000 },
  { id: 'a14', patientId: 'p4', doctorId: '1', date: '2023-11-12', time: '10:30', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'first_time', consultationFee: 2500 },
  { id: 'a15', patientId: 'p5', doctorId: '1', date: '2023-11-12', time: '11:00', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'follow_up', consultationFee: 2000 },
  { id: 'a16', patientId: 'p6', doctorId: '1', date: '2023-11-13', time: '09:00', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'follow_up', consultationFee: 2000 },
  { id: 'a17', patientId: 'p7', doctorId: '1', date: '2023-11-13', time: '09:30', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'follow_up', consultationFee: 2000 },
  { id: 'a18', patientId: 'p8', doctorId: '1', date: '2023-11-13', time: '10:00', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'follow_up', consultationFee: 2000 },
  { id: 'a19', patientId: 'p9', doctorId: '1', date: '2023-11-13', time: '10:30', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'follow_up', consultationFee: 2000 },
  { id: 'a20', patientId: 'p10', doctorId: '1', date: '2023-11-13', time: '11:00', status: 'confirmed', paymentStatus: 'unpaid', visitType: 'follow_up', consultationFee: 2000 },
];

export const mockSchedules: Schedule[] = [
  { id: 's1', dayOfWeek: 0, startTime: '09:00', endTime: '16:00', slotDuration: 30, bufferTime: 0 },
  { id: 's2', dayOfWeek: 1, startTime: '09:00', endTime: '16:00', slotDuration: 30, bufferTime: 0 },
  { id: 's3', dayOfWeek: 2, startTime: '09:00', endTime: '16:00', slotDuration: 30, bufferTime: 0 },
  { id: 's4', dayOfWeek: 3, startTime: '09:00', endTime: '12:00', slotDuration: 30, bufferTime: 0 },
  { id: 's5', dayOfWeek: 4, startTime: '09:00', endTime: '16:00', slotDuration: 30, bufferTime: 0 },
];

import type { MedicalRecord } from '@/entities/medicalRecord';

export const mockMedicalRecords: MedicalRecord[] = [
    { id: 'mr1', appointmentId: 'a3', notes: 'Patient complains of mild headaches and dizziness. Blood pressure normal.', prescription: 'Paracetamol 500mg, 1x morning & evening for 3 days.\nRest well.' },
    { id: 'mr2', appointmentId: 'a6', notes: 'Follow-up for previous condition. Patient is doing much better. No further symptoms.', prescription: 'Continue vitamin supplements for 1 more month.' },
    { id: 'mr3', appointmentId: 'a9', notes: 'Routine check-up. Everything looks fine. Advised to reduce sugar intake.', prescription: 'None' },
];
