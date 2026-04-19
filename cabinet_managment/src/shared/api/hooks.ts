import { useState, useEffect } from 'react';
import { getAppointments, getDashboardStats, getPatients, getSchedules, updateAppointmentStatus } from './doctor.api';
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

export const useAppointments = (filterByToday = false) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAppointments().then(res => {
            if (filterByToday) {
                const today = '2023-11-10'; // mocking today date consistent with data
                setAppointments(res.filter(a => a.date === today));
            } else {
                setAppointments(res);
            }
            setLoading(false);
        });
    }, [filterByToday]);

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
