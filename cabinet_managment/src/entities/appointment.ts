export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'confirmed' | 'arrived' | 'completed' | 'no_show';
  paymentStatus: 'unpaid' | 'paid';
  visitType: 'first_time' | 'follow_up';
  consultationFee: number;
  paidAt?: string;
}
