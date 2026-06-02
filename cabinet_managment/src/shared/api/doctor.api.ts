import api from '@/lib/api';
import type { Appointment } from '@/entities/appointment';
import type { Patient } from '@/entities/patient';
import type {
  Treatment,
  TreatmentsPaginatedResponse,
  CreateTreatmentPayload,
  CreateTreatmentStepPayload,
  UpdateTreatmentStepPayload,
} from '@/entities/treatment';

export const getAppointments = async (filters: { date?: string, patient?: string, status?: string } = {}): Promise<Appointment[]> => {
  const res = await api.get('/appointments', { params: filters });
  const appointments = res.data.appointments || res.data.data || [];
  
  return appointments.map((apt: any) => ({
    id: String(apt.id),
    patient_id: String(apt.patient_id),
    patient: {
      id: apt.patient?.id || apt.patient_id,
      name: apt.patient?.user?.name || apt.patient?.name || apt.name || `Patient #${apt.patient_id}`
    },
    doctor_id: String(apt.doctor_id),
    appointment_date: apt.appointment_date,
    start_time: apt.start_time,
    status: apt.status,
    payment_status: apt.payment_status || 'unpaid',
    consultation_fee: Number(apt.consultation_fee || 0),
    paidAt: apt.paid_at,
  }));
};

export const getPatients = async (): Promise<Patient[]> => {
  const res = await api.get('/patients');
  return res.data.data;
};

export const updateAppointmentStatus = async (id: string, status: Appointment['status']): Promise<Appointment> => {
  const res = await api.patch(`/appointments/${id}/status`, { status });
  return res.data.data;
};

export const getDashboardStats = async () => {
    const res = await api.get('/doctor/stats');
    return res.data;
};

export const getSchedules = async () => {
    const res = await api.get('/doctor/calendar', { 
        params: { date: new Date().toISOString().split('T')[0] } 
    });
    return res.data.data;
};

export const getAppointmentDetails = async (id: string) => {
    const res = await api.get(`/doctor/appointments/${id}`);
    return res.data;
};

export const saveConsultation = async (id: string, data: { diagnosis: string, prescription: string }) => {
    const res = await api.post(`/doctor/appointments/${id}/consultation`, data);
    return res.data;
};

export const getPatientHistory = async (id: string) => {
    const res = await api.get(`/doctor/patients/${id}/history`);
    return res.data;
};

export const setAppointmentPrice = async (id: string, price: number) => {
    const res = await api.patch(`/doctor/appointments/${id}/set-price`, { price });
    return res.data;
};

export const markAppointmentPaid = async (id: string) => {
    const res = await api.patch(`/doctor/appointments/${id}/mark-paid`);
    return res.data;
};

export const getWallet = async () => {
    const res = await api.get('/wallet');
    return res.data;
};

export const getWalletTransactions = async () => {
    const res = await api.get('/wallet/transactions');
    return res.data;
};

export const getRechargeRequests = async () => {
    const res = await api.get('/wallet/recharge-requests');
    return res.data;
};

export const submitRechargeRequest = async (formData: FormData) => {
    const res = await api.post('/wallet/recharge-request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

const mapTreatment = (t: any): Treatment => ({
    id: String(t.id),
    patient_id: String(t.patient_id),
    doctor_id: String(t.doctor_id),
    title: t.title,
    description: t.description,
    diagnosis: t.diagnosis,
    status: t.status,
    total_cost: Number(t.total_cost || 0),
    start_date: t.start_date,
    end_date: t.end_date,
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
    created_at: t.created_at,
    updated_at: t.updated_at,
});

export const getTreatments = async (filters: {
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
} = {}): Promise<TreatmentsPaginatedResponse> => {
    const res = await api.get('/treatments', { params: filters });
    return {
        data: (res.data.data || []).map(mapTreatment),
        meta: res.data.meta || {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: (res.data.data || []).length,
        },
    };
};

export const getTreatment = async (id: string): Promise<Treatment> => {
    const res = await api.get(`/treatments/${id}`);
    return mapTreatment(res.data.data);
};

export const createTreatment = async (payload: CreateTreatmentPayload): Promise<Treatment> => {
    const res = await api.post('/treatments', payload);
    return mapTreatment(res.data.data);
};

export const updateTreatment = async (id: string, payload: Partial<CreateTreatmentPayload & { status: string }>): Promise<Treatment> => {
    const res = await api.put(`/treatments/${id}`, payload);
    return mapTreatment(res.data.data);
};

export const deleteTreatment = async (id: string): Promise<void> => {
    await api.delete(`/treatments/${id}`);
};

export const createTreatmentStep = async (treatmentId: string, payload: CreateTreatmentStepPayload): Promise<Treatment> => {
    const res = await api.post(`/treatments/${treatmentId}/steps`, payload);
    return mapTreatment(res.data.treatment);
};

export const updateTreatmentStep = async (stepId: string, payload: UpdateTreatmentStepPayload): Promise<Treatment> => {
    const res = await api.put(`/treatment-steps/${stepId}`, payload);
    return mapTreatment(res.data.treatment);
};

export const deleteTreatmentStep = async (stepId: string): Promise<Treatment> => {
    const res = await api.delete(`/treatment-steps/${stepId}`);
    return mapTreatment(res.data.treatment);
};

export interface WalkInSlot {
    start: string;
    end: string;
    is_available: boolean;
}

export const getWalkInSlots = async (
    date: string,
    excludeAppointmentId?: string,
): Promise<{ slots: WalkInSlot[]; message?: string }> => {
    const res = await api.get('/appointments/walk-in-slots', {
        params: {
            date,
            exclude_appointment_id: excludeAppointmentId || undefined,
        },
    });
    return {
        slots: res.data.data?.slots ?? [],
        message: res.data.message,
    };
};
