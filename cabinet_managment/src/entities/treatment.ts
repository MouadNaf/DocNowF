export type TreatmentStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type TreatmentStepStatus = 'pending' | 'completed' | 'cancelled';

export interface TreatmentStep {
  id: string;
  treatment_id: string;
  title: string;
  description?: string;
  appointment_id?: string | null;
  status: TreatmentStepStatus;
  scheduled_date?: string;
  scheduled_time?: string;
  completed_at?: string;
  appointment?: {
    id: string;
    appointment_date: string;
    start_time: string;
    status: string;
  };
}

export interface TreatmentProgress {
  completed_steps: number;
  total_steps: number;
  percent: number;
}

export interface Treatment {
  id: string;
  patient_id: string;
  doctor_id: string;
  title: string;
  description?: string;
  diagnosis?: string;
  status: TreatmentStatus;
  total_cost: number;
  paid_amount?: number;
  remaining_balance?: number;
  start_date?: string;
  end_date?: string;
  next_visit?: {
    step_id?: number;
    title?: string;
    date?: string;
    time?: string;
  };
  payments?: TreatmentPayment[];
  patient?: {
    id: number;
    name?: string;
    phone?: string;
    email?: string;
  };
  doctor?: {
    id: number;
    name?: string;
    speciality?: string;
  };
  steps?: TreatmentStep[];
  progress?: TreatmentProgress;
  created_at?: string;
  updated_at?: string;
}

export interface TreatmentsPaginatedResponse {
  data: Treatment[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateTreatmentPayload {
  patient_id: string;
  title: string;
  diagnosis?: string;
  description?: string;
  total_cost?: number;
  start_date?: string;
}

export interface CreateTreatmentStepPayload {
  title: string;
  description?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  appointment_id?: string;
}

export interface UpdateTreatmentStepPayload {
  title?: string;
  description?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  appointment_id?: string;
  status?: TreatmentStepStatus;
}

export interface TreatmentPayment {
  id: string;
  treatment_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'bank_transfer';
  notes?: string;
  recorded_by?: { id: number; name?: string };
  created_at?: string;
}

export interface SecretaryTreatmentStats {
  active_treatments: number;
  upcoming_visits: number;
  completed_treatments: number;
  outstanding_balance: number;
}
