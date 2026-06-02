import React, { useMemo, useState } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { useAppointments } from '@/shared/api/hooks';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Calendar,
    X,
    ChevronRight,
    User,
    Clock,
    CheckCircle2,
    CalendarCheck,
    Hourglass,
    CircleCheck,
    Banknote,
    Filter,
    Stethoscope,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import type { Appointment } from '@/entities/appointment';

const STATUS_CONFIG: Record<
    Appointment['status'],
    { label: string; badge: string; dot: string }
> = {
    confirmed: {
        label: 'Confirmé',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
    },
    arrived: {
        label: 'Arrivé',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
    },
    completed: {
        label: 'Terminé',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
    },
    no_show: {
        label: 'No-show',
        badge: 'bg-orange-50 text-orange-700 border-orange-200',
        dot: 'bg-orange-500',
    },
    cancelled: {
        label: 'Annulé',
        badge: 'bg-red-50 text-red-600 border-red-200',
        dot: 'bg-red-500',
    },
};

const PAYMENT_CONFIG: Record<
    Appointment['payment_status'],
    { label: string; badge: string }
> = {
    paid: { label: 'Payé', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    unpaid: { label: 'Non payé', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const fmtDate = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    });

const fmtTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${suffix}`;
};

const getInitials = (name?: string) =>
    name
        ?.split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase() || '?';

function StatusBadge({ status }: { status: Appointment['status'] }) {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.confirmed;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full border ${config.badge}`}
        >
            <span className={`size-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
}

function AppointmentPreviewPanel({
    appointment,
    onOpen,
}: {
    appointment: Appointment | null;
    onOpen: (id: string) => void;
}) {
    if (!appointment) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="size-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <Stethoscope size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">
                    Survolez un rendez-vous pour voir les détails
                </p>
            </div>
        );
    }

    const payment = PAYMENT_CONFIG[appointment.payment_status] ?? PAYMENT_CONFIG.unpaid;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Détails du rendez-vous</h3>
                <p className="text-xs text-gray-500 mt-0.5">Aperçu rapide du patient</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-14 rounded-full bg-gradient-to-br from-[#1D9E75] to-emerald-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md shadow-emerald-100">
                        {getInitials(appointment.patient?.name)}
                    </div>
                    <div className="min-w-0">
                        <p className="text-lg font-bold text-gray-900 truncate">
                            {appointment.patient?.name || `Patient #${appointment.patient_id}`}
                        </p>
                        <StatusBadge status={appointment.status} />
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Informations du rendez-vous
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase">Date</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">
                                {fmtDate(appointment.appointment_date)}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase">Heure</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">
                                {fmtTime(appointment.start_time)}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase">Tarif</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">
                                {appointment.consultation_fee > 0
                                    ? `${appointment.consultation_fee.toLocaleString('fr-DZ')} DA`
                                    : '—'}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase">Paiement</p>
                            <span
                                className={`inline-flex mt-1 px-2 py-0.5 text-[11px] font-bold rounded-full border ${payment.badge}`}
                            >
                                {payment.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <button
                    onClick={() => onOpen(appointment.id)}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-[#1D9E75] hover:bg-[#15805d] text-white text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                    Ouvrir la consultation
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}

export function DoctorAppointmentsPage() {
    const [search, setSearch] = useState('');
    const [date, setDate] = useState('');
    const [status, setStatus] = useState('');
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const { appointments, loading } = useAppointments({
        patient: search,
        date: date || undefined,
        status: status || undefined,
    });
    const navigate = useNavigate();

    const resetFilters = () => {
        setSearch('');
        setDate('');
        setStatus('');
    };

    const stats = useMemo(() => {
        const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
        const arrived = appointments.filter((a) => a.status === 'arrived').length;
        const completed = appointments.filter((a) => a.status === 'completed').length;
        return {
            total: appointments.length,
            confirmed,
            arrived,
            completed,
        };
    }, [appointments]);

    const previewAppointment = useMemo(() => {
        if (hoveredId) return appointments.find((a) => a.id === hoveredId) ?? null;
        return appointments[0] ?? null;
    }, [appointments, hoveredId]);

    const openConsultation = (id: string) => navigate(`/doctor/consultation/${id}`);

    const hasActiveFilters = search || date || status;

    return (
        <DoctorLayout>
            <div className="space-y-6 max-w-[1600px] mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        Rendez-vous
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Gérez et consultez l'historique complet de vos patients.
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                        title="Total affichés"
                        value={stats.total}
                        icon={<CalendarCheck size={22} />}
                        iconBgClass="bg-emerald-50"
                        iconColorClass="text-[#1D9E75]"
                    />
                    <StatCard
                        title="Confirmés"
                        value={stats.confirmed}
                        icon={<CheckCircle2 size={22} />}
                        iconBgClass="bg-blue-50"
                        iconColorClass="text-blue-500"
                    />
                    <StatCard
                        title="Arrivés"
                        value={stats.arrived}
                        icon={<Hourglass size={22} />}
                        iconBgClass="bg-amber-50"
                        iconColorClass="text-amber-500"
                    />
                    <StatCard
                        title="Terminés"
                        value={stats.completed}
                        icon={<CircleCheck size={22} />}
                        iconBgClass="bg-slate-50"
                        iconColorClass="text-slate-600"
                    />
                </div>

                {/* Filter Toolbar */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter size={16} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Filtres
                        </span>
                        {hasActiveFilters && (
                            <span className="ml-auto text-xs font-semibold text-[#1D9E75]">
                                {appointments.length} résultat{appointments.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-5 relative">
                            <Search
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                                size={17}
                            />
                            <input
                                type="text"
                                placeholder="Rechercher par nom ou téléphone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 text-sm transition-all bg-white"
                            />
                        </div>
                        <div className="md:col-span-3 relative">
                            <Calendar
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                size={17}
                            />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 text-sm transition-all bg-white"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 text-sm transition-all bg-white text-gray-700"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="confirmed">Confirmé</option>
                                <option value="arrived">Arrivé</option>
                                <option value="completed">Terminé</option>
                                <option value="no_show">No-show</option>
                                <option value="cancelled">Annulé</option>
                            </select>
                        </div>
                        <button
                            onClick={resetFilters}
                            disabled={!hasActiveFilters}
                            className="md:col-span-1 h-11 flex items-center justify-center gap-1.5 text-gray-500 font-semibold text-sm hover:text-red-500 disabled:opacity-40 disabled:hover:text-gray-500 transition-colors rounded-xl border border-gray-200 hover:border-red-200 disabled:hover:border-gray-200"
                        >
                            <X size={16} />
                            <span className="hidden lg:inline">Reset</span>
                        </button>
                    </div>
                </div>

                {/* Main Content: List + Preview Panel */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    {/* Appointment List — 65% */}
                    <div className="xl:col-span-8">
                        {loading ? (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
                                <div className="animate-spin h-9 w-9 border-[3px] border-[#1D9E75] border-t-transparent rounded-full mb-4" />
                                <p className="text-sm font-medium">Chargement des rendez-vous...</p>
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20 space-y-4">
                                <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                    <Search size={24} className="text-gray-300" />
                                </div>
                                <div>
                                    <p className="text-gray-700 font-semibold">Aucun rendez-vous trouvé</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Modifiez vos filtres pour afficher d'autres résultats.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {appointments.map((apt) => {
                                    const payment =
                                        PAYMENT_CONFIG[apt.payment_status] ?? PAYMENT_CONFIG.unpaid;
                                    const isHovered = hoveredId === apt.id;

                                    return (
                                        <div
                                            key={apt.id}
                                            onClick={() => openConsultation(apt.id)}
                                            onMouseEnter={() => setHoveredId(apt.id)}
                                            onMouseLeave={() => setHoveredId(null)}
                                            className={[
                                                'group bg-white rounded-2xl border shadow-sm cursor-pointer transition-all duration-200 overflow-hidden',
                                                isHovered
                                                    ? 'border-[#1D9E75]/40 shadow-md ring-2 ring-[#1D9E75]/10'
                                                    : 'border-gray-100 hover:border-gray-200 hover:shadow-md',
                                            ].join(' ')}
                                        >
                                            <div className="p-5 space-y-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="size-11 rounded-full bg-gradient-to-br from-[#1D9E75] to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                            {apt.patient?.name ? (
                                                                getInitials(apt.patient.name)
                                                            ) : (
                                                                <User size={18} />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[#1D9E75] transition-colors">
                                                                {apt.patient?.name ||
                                                                    `Patient #${apt.patient_id}`}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                                <Calendar size={12} />
                                                                {fmtDate(apt.appointment_date)}
                                                                <span className="text-gray-300">·</span>
                                                                <Clock size={12} />
                                                                {fmtTime(apt.start_time)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="size-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#1D9E75] group-hover:text-white transition-all shrink-0">
                                                        <ChevronRight size={16} />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <StatusBadge status={apt.status} />
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full border ${payment.badge}`}
                                                    >
                                                        <Banknote size={11} />
                                                        {payment.label}
                                                    </span>
                                                </div>

                                                {apt.consultation_fee > 0 && (
                                                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            Tarif consultation
                                                        </span>
                                                        <span className="text-sm font-bold text-gray-900">
                                                            {apt.consultation_fee.toLocaleString('fr-DZ')} DA
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Preview Panel — 35% */}
                    <div className="xl:col-span-4 xl:sticky xl:top-0">
                        <AppointmentPreviewPanel
                            appointment={previewAppointment}
                            onOpen={openConsultation}
                        />
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
}
