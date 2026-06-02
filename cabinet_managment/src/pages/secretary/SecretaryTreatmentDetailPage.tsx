import { useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SecretaryLayout } from '@/components/layout/SecretaryLayout';
import {
    useSecretaryTreatment,
    useScheduleTreatmentVisit,
    useRescheduleTreatmentVisit,
    useCancelTreatmentVisit,
    useRecordTreatmentPayment,
} from '@/hooks/useSecretary';
import { ScheduleFollowUpModal } from '@/components/secretary/ScheduleFollowUpModal';
import { AddTreatmentPaymentModal } from '@/components/secretary/AddTreatmentPaymentModal';
import { ROUTES } from '@/constants/routes';
import {
    ArrowLeft,
    User,
    Stethoscope,
    Calendar,
    Clock,
    Banknote,
    Plus,
    CheckCircle2,
    Circle,
    Ban,
    Phone,
    Mail,
    CalendarClock,
    XCircle,
    Printer,
} from 'lucide-react';
import type { TreatmentStatus, TreatmentStep, TreatmentStepStatus } from '@/entities/treatment';

const STATUS_CONFIG: Record<TreatmentStatus, { label: string; badge: string }> = {
    planned: { label: 'Planifié', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    in_progress: { label: 'En cours', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    completed: { label: 'Terminé', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Annulé', badge: 'bg-red-50 text-red-600 border-red-200' },
};

const STEP_STATUS: Record<TreatmentStepStatus, { label: string; icon: ReactNode; color: string }> = {
    pending: { label: 'En attente', icon: <Circle size={16} />, color: 'text-gray-400' },
    completed: { label: 'Terminé', icon: <CheckCircle2 size={16} />, color: 'text-[#1D9E75]' },
    cancelled: { label: 'Annulé', icon: <Ban size={16} />, color: 'text-red-400' },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
    cash: 'Espèces',
    card: 'Carte',
    bank_transfer: 'Virement',
};

const fmtDate = (iso?: string) =>
    iso
        ? new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          })
        : '—';

const normalizeTime = (time?: string) => (time ? time.slice(0, 5) : '');

export function SecretaryTreatmentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: treatment, isLoading, refetch } = useSecretaryTreatment(id);
    const scheduleVisit = useScheduleTreatmentVisit();
    const rescheduleVisit = useRescheduleTreatmentVisit();
    const cancelVisit = useCancelTreatmentVisit();
    const recordPayment = useRecordTreatmentPayment();

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [rescheduleStep, setRescheduleStep] = useState<TreatmentStep | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const handleSchedule = async (payload: { date: string; time: string; notes?: string; title?: string }) => {
        if (!id) return;
        setActionLoading(true);
        try {
            await scheduleVisit.mutateAsync({ treatmentId: id, payload });
            await refetch();
        } finally {
            setActionLoading(false);
        }
    };

    const handleReschedule = async (payload: { date: string; time: string; notes?: string }) => {
        if (!id || !rescheduleStep) return;
        setActionLoading(true);
        try {
            await rescheduleVisit.mutateAsync({
                treatmentId: id,
                stepId: rescheduleStep.id,
                payload,
            });
            await refetch();
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelStep = async (step: TreatmentStep) => {
        if (!id || !confirm('Annuler cette visite ?')) return;
        setActionLoading(true);
        try {
            await cancelVisit.mutateAsync({ treatmentId: id, stepId: step.id });
            await refetch();
        } finally {
            setActionLoading(false);
        }
    };

    const handlePayment = async (payload: {
        amount: number;
        payment_method: 'cash' | 'card' | 'bank_transfer';
        notes?: string;
    }) => {
        if (!id) return;
        setActionLoading(true);
        try {
            await recordPayment.mutateAsync({ treatmentId: id, payload });
            await refetch();
        } finally {
            setActionLoading(false);
        }
    };

    const handlePrint = () => window.print();

    if (isLoading) {
        return (
            <SecretaryLayout title="Traitement">
                <p className="text-gray-400 text-sm py-12 text-center">Chargement...</p>
            </SecretaryLayout>
        );
    }

    if (!treatment) {
        return (
            <SecretaryLayout title="Traitement">
                <div className="text-center py-16">
                    <p className="text-gray-500">Traitement introuvable.</p>
                    <button
                        onClick={() => navigate(ROUTES.SECRETARY_TREATMENTS)}
                        className="mt-4 text-[#1D9E75] text-sm font-semibold hover:underline"
                    >
                        Retour à la liste
                    </button>
                </div>
            </SecretaryLayout>
        );
    }

    const statusCfg = STATUS_CONFIG[treatment.status];
    const progress = treatment.progress ?? { completed_steps: 0, total_steps: 0, percent: 0 };
    const steps = treatment.steps ?? [];
    const remaining = treatment.remaining_balance ?? 0;
    const paid = treatment.paid_amount ?? 0;

    return (
        <SecretaryLayout title={treatment.title}>
            <div className="space-y-5 max-w-[1200px]">
                <button
                    onClick={() => navigate(ROUTES.SECRETARY_TREATMENTS)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#1D9E75]"
                >
                    <ArrowLeft size={16} />
                    Retour aux traitements
                </button>

                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl font-bold text-gray-900">{treatment.title}</h1>
                                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${statusCfg.badge}`}>
                                    {statusCfg.label}
                                </span>
                            </div>
                            {treatment.description && (
                                <p className="text-sm text-gray-500 mt-2">{treatment.description}</p>
                            )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setShowScheduleModal(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1D9E75] text-white text-xs font-bold rounded-lg"
                            >
                                <Plus size={14} />
                                Planifier visite
                            </button>
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#1D9E75] text-[#1D9E75] text-xs font-bold rounded-lg"
                            >
                                <Banknote size={14} />
                                Paiement
                            </button>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg"
                            >
                                <Printer size={14} />
                                Imprimer
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 pt-5 border-t">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-gray-700">
                                {progress.completed_steps}/{progress.total_steps} étapes terminées
                            </span>
                            <span className="font-bold text-[#1D9E75]">{progress.percent}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#1D9E75] rounded-full transition-all"
                                style={{ width: `${progress.percent}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b">
                                <h2 className="font-semibold text-gray-900">Étapes du traitement</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Consultation seule — modification médicale interdite</p>
                            </div>
                            {steps.length === 0 ? (
                                <p className="text-gray-400 text-sm py-10 text-center">Aucune étape planifiée.</p>
                            ) : (
                                <div className="divide-y">
                                    {steps.map((step, index) => {
                                        const stepCfg = STEP_STATUS[step.status];
                                        return (
                                            <div key={step.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className={`mt-0.5 ${stepCfg.color}`}>{stepCfg.icon}</div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {index + 1}. {step.title}
                                                        </p>
                                                        {step.description && (
                                                            <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                                                        )}
                                                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={11} />
                                                                {fmtDate(step.scheduled_date || step.appointment?.appointment_date)}
                                                            </span>
                                                            {(step.scheduled_time || step.appointment?.start_time) && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={11} />
                                                                    {normalizeTime(step.scheduled_time || step.appointment?.start_time)}
                                                                </span>
                                                            )}
                                                            <span className={`font-semibold ${stepCfg.color}`}>{stepCfg.label}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {step.status === 'pending' && (
                                                    <div className="flex gap-2 shrink-0">
                                                        <button
                                                            onClick={() => setRescheduleStep(step)}
                                                            disabled={actionLoading}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg"
                                                        >
                                                            <CalendarClock size={12} />
                                                            Reprogrammer
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelStep(step)}
                                                            disabled={actionLoading}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg"
                                                        >
                                                            <XCircle size={12} />
                                                            Annuler
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {(treatment.payments?.length ?? 0) > 0 && (
                            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b">
                                    <h2 className="font-semibold text-gray-900">Historique des paiements</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-xs text-gray-400 uppercase border-b">
                                                <th className="px-5 py-3">Date</th>
                                                <th className="px-5 py-3">Montant</th>
                                                <th className="px-5 py-3">Mode</th>
                                                <th className="px-5 py-3">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {treatment.payments!.map((p) => (
                                                <tr key={p.id}>
                                                    <td className="px-5 py-3 text-gray-600">
                                                        {p.created_at
                                                            ? new Date(p.created_at).toLocaleDateString('fr-FR')
                                                            : '—'}
                                                    </td>
                                                    <td className="px-5 py-3 font-semibold">
                                                        {p.amount.toLocaleString('fr-DZ')} DA
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-600">
                                                        {PAYMENT_METHOD_LABEL[p.payment_method] ?? p.payment_method}
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-500">{p.notes || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-5">
                        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <User size={16} className="text-[#1D9E75]" />
                                Patient
                            </h3>
                            <p className="text-sm font-semibold">{treatment.patient?.name || '—'}</p>
                            {treatment.patient?.phone && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Phone size={11} /> {treatment.patient.phone}
                                </p>
                            )}
                            {treatment.patient?.email && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Mail size={11} /> {treatment.patient.email}
                                </p>
                            )}
                        </div>

                        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-2">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Stethoscope size={16} className="text-[#1D9E75]" />
                                Médecin
                            </h3>
                            <p className="text-sm font-semibold">{treatment.doctor?.name || '—'}</p>
                            {treatment.doctor?.speciality && (
                                <p className="text-xs text-gray-500">{treatment.doctor.speciality}</p>
                            )}
                        </div>

                        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Banknote size={16} className="text-[#1D9E75]" />
                                Paiements
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Coût total</span>
                                    <span className="font-bold">
                                        {treatment.total_cost > 0
                                            ? `${treatment.total_cost.toLocaleString('fr-DZ')} DA`
                                            : '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Payé</span>
                                    <span className="font-semibold text-[#1D9E75]">
                                        {paid.toLocaleString('fr-DZ')} DA
                                    </span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-500">Solde restant</span>
                                    <span className="font-bold text-orange-600">
                                        {remaining.toLocaleString('fr-DZ')} DA
                                    </span>
                                </div>
                            </div>
                            <div className="pt-2 space-y-1 text-xs text-gray-400">
                                <div className="flex justify-between">
                                    <span>Début</span>
                                    <span>{fmtDate(treatment.start_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Fin</span>
                                    <span>{fmtDate(treatment.end_date)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ScheduleFollowUpModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onSave={handleSchedule}
                loading={actionLoading}
            />

            <ScheduleFollowUpModal
                isOpen={!!rescheduleStep}
                onClose={() => setRescheduleStep(null)}
                onSave={handleReschedule}
                step={rescheduleStep}
                loading={actionLoading}
            />

            <AddTreatmentPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSave={handlePayment}
                remainingBalance={remaining}
                loading={actionLoading}
            />
        </SecretaryLayout>
    );
}
