import api from '@/lib/api';
import type { Appointment } from '@/entities/appointment';
import type { Patient } from '@/entities/patient';

export const getAppointments = async (filters: { date?: string, patient?: string, status?: string } = {}): Promise<Appointment[]> => {
  const res = await api.get('/appointments', { params: filters });
  return res.data.data;
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
