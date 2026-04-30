import { useState, useEffect } from 'react';
import { getAppointments, getDashboardStats, getPatients, getSchedules, updateAppointmentStatus, getAppointmentDetails, saveConsultation, getPatientHistory } from './doctor.api';
import type { Appointment } from '@/entities/appointment';
import type { Patient } from '@/entities/patient';
import type { Schedule } from '@/entities/schedule';

export const useDashboardStats = () => {
    const [data, setData] = useState<{
        todayAppointments: number;
        totalPatients: number;
        noShows: number;
        revenueToday: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardStats().then(res => {
            setData(res);
            setLoading(false);
        });
    }, []);

    return { data, loading };
};

export const useAppointments = (filters: { date?: string, patient?: string, status?: string } = {}) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAppointments(filters).then(res => {
            setAppointments(res);
            setLoading(false);
        });
    }, [JSON.stringify(filters)]);

    const changeStatus = async (id: string, status: Appointment['status']) => {
        const updated = await updateAppointmentStatus(id, status);
        setAppointments(prev => prev.map(a => a.id === id ? updated : a));
    };

    return { appointments, loading, changeStatus };
};

export const usePatients = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPatients().then(res => {
            setPatients(res);
            setLoading(false);
        });
    }, []);

    return { patients, loading };
};

export const useAppointmentDetails = (id: string | undefined) => {
    const [data, setData] = useState<{ appointment: any, patient: any } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        getAppointmentDetails(id).then(res => {
            setData(res);
            setLoading(false);
        });
    }, [id]);

    return { data, loading };
};

export const useSaveConsultation = () => {
    const [loading, setLoading] = useState(false);

    const save = async (id: string, data: { diagnosis: string, prescription: string }) => {
        setLoading(true);
        try {
            const res = await saveConsultation(id, data);
            return res;
        } finally {
            setLoading(false);
        }
    };

    return { save, loading };
};

export const usePatientHistory = (id: string | undefined) => {
    const [data, setData] = useState<{ patient: any, history: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        getPatientHistory(id).then(res => {
            setData(res);
            setLoading(false);
        });
    }, [id]);

    return { data, loading };
};

export const useSchedules = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSchedules().then(res => {
            setSchedules(res);
            setLoading(false);
        });
    }, []);

    return { schedules, loading };
};
