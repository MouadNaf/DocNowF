import type { Appointment } from '@/entities/appointment';
import type { Patient } from '@/entities/patient';
import { mockAppointments, mockPatients, mockSchedules, mockMedicalRecords } from '@/lib/mock/auth.mock';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getAppointments = async (): Promise<Appointment[]> => {
  await delay(500);
  return [...mockAppointments];
};

export const getPatients = async (): Promise<Patient[]> => {
  await delay(500);
  return [...mockPatients];
};

export const updateAppointmentStatus = async (id: string, status: Appointment['status']): Promise<Appointment> => {
  await delay(400);
  const apt = mockAppointments.find(a => a.id === id);
  if (!apt) throw new Error('Appointment not found');
  apt.status = status;
  return { ...apt };
};

export const getDashboardStats = async () => {
    await delay(300);
    const today = '2023-11-10'; // mock today's date based on our mock data
    const todayApts = mockAppointments.filter(a => a.date === today);
    const totalPatients = mockPatients.length;
    const noShows = mockAppointments.filter(a => a.status === 'no_show').length;
    const revenueToday = todayApts.filter(a => a.paymentStatus === 'paid').reduce((acc, curr) => acc + curr.consultationFee, 0);

    return {
        todayAppointments: todayApts.length,
        totalPatients,
        noShows,
        revenueToday
    };
};

export const getSchedules = async () => {
    await delay(300);
    return [...mockSchedules];
};
