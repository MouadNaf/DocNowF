import { create } from 'zustand';
import type { Appointment, Patient, AppointmentStatus, WaitingEntry } from '@/types/secretary.types';

// ─── Helpers ────────────────────────────────────────────────────────────────
const rel = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_PATIENTS: Patient[] = [
  { id: 'p1',  name: 'Amine Benali',       phone: '0555 123 456' },
  { id: 'p2',  name: 'Fatima Zohra Amir',  phone: '0661 987 654' },
  { id: 'p3',  name: 'Karim Yelles',       phone: '0770 112 233' },
  { id: 'p4',  name: 'Yasmine Mansouri',   phone: '0550 445 566' },
  { id: 'p5',  name: 'Ahmed Brahimi',      phone: '0661 778 899' },
  { id: 'p6',  name: 'Meriem Bounedjah',   phone: '0770 998 877' },
  { id: 'p7',  name: 'Rachid Messaoudi',   phone: '0552 334 455' },
  { id: 'p8',  name: 'Kenza Saidi',        phone: '0663 445 566' },
  { id: 'p9',  name: 'Hassan Khelif',      phone: '0771 556 677' },
  { id: 'p10', name: 'Leila Touati',       phone: '0554 667 788' },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  // Today
  { id: 'a1',  patientId: 'p1',  date: rel(0),  time: '08:30', visitType: 'Première visite', status: 'Confirmé',  paymentStatus: 'Non payé' },
  { id: 'a2',  patientId: 'p2',  date: rel(0),  time: '09:00', visitType: 'Suivi',           status: 'Arrivé',    paymentStatus: 'Non payé' },
  { id: 'a3',  patientId: 'p3',  date: rel(0),  time: '09:30', visitType: 'Première visite', status: 'Terminé',   paymentStatus: 'Payé'     },
  { id: 'a4',  patientId: 'p4',  date: rel(0),  time: '10:00', visitType: 'Suivi',           status: 'Terminé',   paymentStatus: 'Non payé' },
  { id: 'a5',  patientId: 'p5',  date: rel(0),  time: '10:30', visitType: 'Première visite', status: 'Annulé',    paymentStatus: 'Non payé' },
  { id: 'a6',  patientId: 'p6',  date: rel(0),  time: '11:00', visitType: 'Suivi',           status: 'Confirmé',  paymentStatus: 'Non payé' },
  { id: 'a7',  patientId: 'p7',  date: rel(0),  time: '13:00', visitType: 'Première visite', status: 'Confirmé',  paymentStatus: 'Non payé' },
  { id: 'a8',  patientId: 'p8',  date: rel(0),  time: '14:00', visitType: 'Suivi',           status: 'Arrivé',    paymentStatus: 'Non payé' },
  { id: 'a9',  patientId: 'p9',  date: rel(0),  time: '15:00', visitType: 'Première visite', status: 'Confirmé',  paymentStatus: 'Non payé' },
  { id: 'a10', patientId: 'p10', date: rel(0),  time: '16:30', visitType: 'Suivi',           status: 'No-show',   paymentStatus: 'Non payé' },
  // Tomorrow
  { id: 'a11', patientId: 'p1',  date: rel(1),  time: '09:00', visitType: 'Suivi',           status: 'Confirmé',  paymentStatus: 'Non payé' },
  { id: 'a12', patientId: 'p3',  date: rel(1),  time: '10:00', visitType: 'Première visite', status: 'Confirmé',  paymentStatus: 'Non payé' },
  { id: 'a13', patientId: 'p5',  date: rel(1),  time: '11:00', visitType: 'Suivi',           status: 'Confirmé',  paymentStatus: 'Non payé' },
  { id: 'a14', patientId: 'p7',  date: rel(1),  time: '13:30', visitType: 'Première visite', status: 'Confirmé',  paymentStatus: 'Non payé' },
  { id: 'a15', patientId: 'p9',  date: rel(1),  time: '15:00', visitType: 'Suivi',           status: 'Confirmé',  paymentStatus: 'Non payé' },
  // Yesterday
  { id: 'a16', patientId: 'p2',  date: rel(-1), time: '09:00', visitType: 'Première visite', status: 'Terminé',   paymentStatus: 'Payé'     },
  { id: 'a17', patientId: 'p4',  date: rel(-1), time: '10:00', visitType: 'Première visite', status: 'No-show',   paymentStatus: 'Non payé' },
  { id: 'a18', patientId: 'p6',  date: rel(-1), time: '11:30', visitType: 'Suivi',           status: 'Terminé',   paymentStatus: 'Payé'     },
  { id: 'a19', patientId: 'p8',  date: rel(-1), time: '14:00', visitType: 'Première visite', status: 'Terminé',   paymentStatus: 'Payé'     },
  { id: 'a20', patientId: 'p10', date: rel(-1), time: '16:00', visitType: 'Suivi',           status: 'Terminé',   paymentStatus: 'Non payé' },
];

const MOCK_WAITING: WaitingEntry[] = [
  { id: 'w1', patientId: 'p2', addedAt: new Date().toISOString(), reason: 'Douleur abdominale', priority: 'urgent' },
  { id: 'w2', patientId: 'p5', addedAt: new Date(Date.now() - 12 * 60000).toISOString(), reason: 'Renouvellement ordonnance', priority: 'normal' },
  { id: 'w3', patientId: 'p8', addedAt: new Date(Date.now() - 25 * 60000).toISOString(), reason: 'Fièvre', priority: 'urgent' },
  { id: 'w4', patientId: 'p1', addedAt: new Date(Date.now() - 40 * 60000).toISOString(), reason: undefined, priority: 'normal' },
];

// ─── Store types ─────────────────────────────────────────────────────────────
interface AppointmentStore {
  patients: Patient[];
  appointments: Appointment[];
  waitingList: WaitingEntry[];

  addPatient: (data: Omit<Patient, 'id'>) => Patient;

  addAppointment: (data: Omit<Appointment, 'id' | 'status' | 'paymentStatus'>) => void;
  updateAppointment: (id: string, patch: Partial<Pick<Appointment, 'date' | 'time' | 'visitType' | 'notes'>>) => void;
  deleteAppointment: (id: string) => void;

  updateStatus: (id: string, status: AppointmentStatus) => void;
  cancelAppointment: (id: string) => void;         // secretary: sets → 'Annulé'
  markPaid: (id: string) => void;
  reschedule: (id: string, date: string, time: string) => void;

  addToWaitingList: (data: Omit<WaitingEntry, 'id' | 'addedAt'>) => void;
  removeFromWaiting: (id: string) => void;
  promoteFromWaiting: (waitingId: string, date: string, time: string) => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  patients: MOCK_PATIENTS,
  appointments: MOCK_APPOINTMENTS,
  waitingList: MOCK_WAITING,

  addPatient: (data) => {
    const newPatient: Patient = { ...data, id: `p_${Date.now()}` };
    set((s) => ({ patients: [...s.patients, newPatient] }));
    return newPatient;
  },

  addAppointment: (data) => {
    const apt: Appointment = { ...data, id: `a_${Date.now()}`, status: 'Confirmé', paymentStatus: 'Non payé' };
    set((s) => ({ appointments: [...s.appointments, apt] }));
  },

  updateAppointment: (id, patch) => {
    set((s) => ({ appointments: s.appointments.map((a) => a.id === id ? { ...a, ...patch } : a) }));
  },

  deleteAppointment: (id) => {
    set((s) => ({ appointments: s.appointments.filter((a) => a.id !== id) }));
  },

  updateStatus: (id, status) => {
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id !== id ? a : {
          ...a,
          status,
          paymentStatus: status === 'No-show' ? 'Non payé' : a.paymentStatus,
        }
      ),
    }));
  },

  cancelAppointment: (id) => {
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === id && (a.status === 'Confirmé' || a.status === 'Arrivé')
          ? { ...a, status: 'Annulé', paymentStatus: 'Non payé' }
          : a
      ),
    }));
  },

  markPaid: (id) => {
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === id && a.status === 'Terminé' ? { ...a, paymentStatus: 'Payé' } : a
      ),
    }));
  },

  reschedule: (id, date, time) => {
    set((s) => ({ appointments: s.appointments.map((a) => a.id === id ? { ...a, date, time } : a) }));
  },

  addToWaitingList: (data) => {
    const entry: WaitingEntry = { ...data, id: `w_${Date.now()}`, addedAt: new Date().toISOString() };
    set((s) => ({ waitingList: [...s.waitingList, entry] }));
  },

  removeFromWaiting: (id) => {
    set((s) => ({ waitingList: s.waitingList.filter((w) => w.id !== id) }));
  },

  promoteFromWaiting: (waitingId, date, time) => {
    const { waitingList } = get();
    const entry = waitingList.find((w) => w.id === waitingId);
    if (!entry) return;
    const apt: Appointment = {
      id: `a_${Date.now()}`,
      patientId: entry.patientId,
      date, time,
      visitType: 'Première visite',
      status: 'Confirmé',
      paymentStatus: 'Non payé',
      notes: entry.reason,
    };
    set((s) => ({
      appointments: [...s.appointments, apt],
      waitingList: s.waitingList.filter((w) => w.id !== waitingId),
    }));
  },
}));
