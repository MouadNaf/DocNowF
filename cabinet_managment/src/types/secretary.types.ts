export type AppointmentStatus = 'Confirmé' | 'Arrivé' | 'Terminé' | 'No-show' | 'Annulé';
export type PaymentStatus = 'Payé' | 'Non payé';
export type VisitType = 'Première visite' | 'Suivi';

export interface Patient {
  id: string;
  name: string;
  phone: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string; // ISO: YYYY-MM-DD
  time: string; // HH:mm
  visitType: VisitType;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface WaitingEntry {
  id: string;
  patientId: string;
  addedAt: string; // ISO datetime
  reason?: string;
  priority: 'normal' | 'urgent';
}

// ─── Role-based permissions ──────────────────────────────────────────────────
export type UserRole = 'secretary' | 'doctor';

export const SECRETARY_PERMISSIONS = {
  canCreate:       true,
  canUpdate:       true,
  canCancel:       true,   // sets status → 'Annulé'
  canMarkArrived:  true,
  canMarkComplete: false,  // doctor only — sets status → 'Terminé'
  canMarkNoShow:   false,  // doctor only — sets status → 'No-show'
  canMarkPaid:     true,
  canViewPatients: true,
  canCreatePatients: true,
  canWriteMedical: false,
} as const;

export const DOCTOR_PERMISSIONS = {
  canCreate:       true,
  canUpdate:       true,
  canCancel:       true,
  canMarkArrived:  true,
  canMarkComplete: true,
  canMarkNoShow:   true,
  canMarkPaid:     true,
  canViewPatients: true,
  canCreatePatients: true,
  canWriteMedical: true,
} as const;
