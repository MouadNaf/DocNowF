export interface Appointment {
  id: string;
  patient_id: string;
  patient?: {
    id: number;
    name: string;
  };
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  status: 'confirmed' | 'arrived' | 'completed' | 'no_show' | 'cancelled';
  payment_status: 'unpaid' | 'paid';
  consultation_fee: number;
  paidAt?: string;
}
