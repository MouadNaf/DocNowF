import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointments, getDashboardStats, getPatients, getSchedules, updateAppointmentStatus, getAppointmentDetails, saveConsultation, getPatientHistory, getWallet, getWalletTransactions, getRechargeRequests, getTreatments, getTreatment, createTreatment, deleteTreatment, createTreatmentStep, updateTreatmentStep, deleteTreatmentStep, getWalkInSlots } from './doctor.api';
import type { Appointment } from '@/entities/appointment';
import type { Patient } from '@/entities/patient';
import type { Schedule } from '@/entities/schedule';
import type { Treatment, TreatmentsPaginatedResponse, CreateTreatmentPayload, CreateTreatmentStepPayload, UpdateTreatmentStepPayload } from '@/entities/treatment';

export const useDashboardStats = () => {
    const query = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: getDashboardStats,
        refetchInterval: 30000,
    });
    return { data: query.data, loading: query.isLoading, refresh: query.refetch };
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

export const useWallet = () => {
    const query = useQuery({
        queryKey: ['wallet'],
        queryFn: getWallet,
        refetchInterval: 5000,
    });
    return { data: query.data, loading: query.isLoading, refresh: query.refetch };
};

export const useWalletTransactions = () => {
    const query = useQuery({
        queryKey: ['wallet-transactions'],
        queryFn: async () => {
            const res = await getWalletTransactions();
            return res.data || [];
        }
    });
    return { transactions: query.data || [], loading: query.isLoading, refresh: query.refetch };
};

export const useRechargeRequests = () => {
    const query = useQuery({
        queryKey: ['recharge-requests'],
        queryFn: getRechargeRequests,
        refetchInterval: 5000,
    });
    return { requests: query.data || [], loading: query.isLoading, refresh: query.refetch };
};

export const useTreatments = (filters: { search?: string; status?: string; page?: number; per_page?: number } = {}) => {
    const [result, setResult] = useState<TreatmentsPaginatedResponse>({
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    });
    const [loading, setLoading] = useState(true);

    const refresh = () => {
        setLoading(true);
        return getTreatments(filters).then((res) => {
            setResult(res);
            setLoading(false);
            return res;
        });
    };

    useEffect(() => {
        refresh();
    }, [JSON.stringify(filters)]);

    return { treatments: result.data, meta: result.meta, loading, refresh };
};

export const useTreatment = (id: string | undefined) => {
    const [treatment, setTreatment] = useState<Treatment | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = () => {
        if (!id) return Promise.resolve(null);
        setLoading(true);
        return getTreatment(id).then((res) => {
            setTreatment(res);
            setLoading(false);
            return res;
        });
    };

    useEffect(() => {
        refresh();
    }, [id]);

    const addStep = async (payload: CreateTreatmentStepPayload) => {
        if (!id) return;
        const updated = await createTreatmentStep(id, payload);
        setTreatment(updated);
        return updated;
    };

    const editStep = async (stepId: string, payload: UpdateTreatmentStepPayload) => {
        const updated = await updateTreatmentStep(stepId, payload);
        setTreatment(updated);
        return updated;
    };

    const removeStep = async (stepId: string) => {
        const updated = await deleteTreatmentStep(stepId);
        setTreatment(updated);
        return updated;
    };

    return { treatment, loading, refresh, addStep, editStep, removeStep };
};

export const useCreateTreatment = () => {
    const [loading, setLoading] = useState(false);

    const create = async (payload: CreateTreatmentPayload) => {
        setLoading(true);
        try {
            return await createTreatment(payload);
        } finally {
            setLoading(false);
        }
    };

    return { create, loading };
};

export const useDeleteTreatment = () => {
    const [loading, setLoading] = useState(false);

    const remove = async (id: string) => {
        setLoading(true);
        try {
            await deleteTreatment(id);
        } finally {
            setLoading(false);
        }
    };

    return { remove, loading };
};

export const useWalkInSlots = (date: string, excludeAppointmentId?: string) => {
    const [slots, setSlots] = useState<{ start: string; end: string; is_available: boolean }[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | undefined>();

    useEffect(() => {
        if (!date) return;
        setLoading(true);
        getWalkInSlots(date, excludeAppointmentId)
            .then((res) => {
                setSlots(res.slots);
                setMessage(res.message);
            })
            .finally(() => setLoading(false));
    }, [date, excludeAppointmentId]);

    return { slots, loading, message };
};

