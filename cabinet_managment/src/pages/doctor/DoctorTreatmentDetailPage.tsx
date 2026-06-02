import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { useTreatment, useDeleteTreatment } from '@/shared/api/hooks';
import { TreatmentStepModal } from '@/components/doctor/TreatmentStepModal';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import {
    ArrowLeft,
    User,
    Stethoscope,
    Calendar,
    Clock,
    Banknote,
    Plus,
    Edit2,
    Trash2,
    CheckCircle2,
    Circle,
    Ban,
    Phone,
    Mail,
} from 'lucide-react';
import type { TreatmentStatus, TreatmentStep, TreatmentStepStatus } from '@/entities/treatment';

const STATUS_CONFIG: Record<TreatmentStatus, { label: string; badge: string }> = {
    planned: { label: 'Planifié', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    in_progress: { label: 'En cours', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    completed: { label: 'Terminé', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Annulé', badge: 'bg-red-50 text-red-600 border-red-200' },
};

const STEP_STATUS: Record<TreatmentStepStatus, { label: string; icon: React.ReactNode; color: string }> = {
    pending: { label: 'En attente', icon: <Circle size={16} />, color: 'text-gray-400' },
    completed: { label: 'Terminé', icon: <CheckCircle2 size={16} />, color: 'text-[#1D9E75]' },
    cancelled: { label: 'Annulé', icon: <Ban size={16} />, color: 'text-red-400' },
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

export function DoctorTreatmentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { treatment, loading, addStep, editStep, removeStep } = useTreatment(id);
    const { remove, loading: deleting } = useDeleteTreatment();

    const [showStepModal, setShowStepModal] = useState(false);
    const [editingStep, setEditingStep] = useState<TreatmentStep | null>(null);
    const [stepLoading, setStepLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmDeleteStep, setConfirmDeleteStep] = useState<string | null>(null);

    const handleSaveStep = async (payload: Parameters<typeof addStep>[0]) => {
        setStepLoading(true);
        try {
            if (editingStep) {
                await editStep(editingStep.id, payload);
            } else {
                await addStep(payload);
            }
        } finally {
            setStepLoading(false);
        }
    };

    const handleMarkCompleted = async (step: TreatmentStep) => {
        setStepLoading(true);
        try {
            await editStep(step.id, { status: 'completed' });
        } finally {
            setStepLoading(false);
        }
    };

    const handleDeleteStep = async (stepId: string) => {
        setStepLoading(true);
        try {
            await removeStep(stepId);
            setConfirmDeleteStep(null);
        } finally {
            setStepLoading(false);
        }
    };

    const handleDeleteTreatment = async () => {
        if (!id) return;
        await remove(id);
        navigate(ROUTES.DOCTOR_TREATMENTS);
    };

    if (loading) {
        return (
            <DoctorLayout>
                <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                    <div className="animate-spin h-9 w-9 border-[3px] border-[#1D9E75] border-t-transparent rounded-full mb-4" />
                    <p className="text-sm font-medium">Chargement du traitement...</p>
                </div>
            </DoctorLayout>
        );
    }

    if (!treatment) {
        return (
            <DoctorLayout>
                <div className="text-center py-32">
                    <p className="text-gray-500 font-medium">Traitement introuvable.</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate(ROUTES.DOCTOR_TREATMENTS)}>
                        Retour à la liste
                    </Button>
                </div>
            </DoctorLayout>
        );
    }

    const statusCfg = STATUS_CONFIG[treatment.status];
    const progress = treatment.progress ?? { completed_steps: 0, total_steps: 0, percent: 0 };
    const steps = treatment.steps ?? [];

    return (
        <DoctorLayout>
            <div className="space-y-6 max-w-[1200px] mx-auto">
                <button
                    onClick={() => navigate(ROUTES.DOCTOR_TREATMENTS)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#1D9E75] transition-colors"
                >
                    <ArrowLeft size={18} />
                    Retour aux traitements
                </button>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-black text-gray-900">{treatment.title}</h1>
                                <span
                                    className={`inline-flex px-3 py-1 text-[11px] font-bold rounded-full border ${statusCfg.badge}`}
                                >
                                    {statusCfg.label}
                                </span>
                            </div>
                            {treatment.diagnosis && (
                                <p className="text-sm text-gray-600 mt-2">
                                    <span className="font-semibold">Diagnostic:</span> {treatment.diagnosis}
                                </p>
                            )}
                            {treatment.description && (
                                <p className="text-sm text-gray-500 mt-1">{treatment.description}</p>
                            )}
                        </div>
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl border border-red-100 transition-colors"
                        >
                            <Trash2 size={16} />
                            Supprimer
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Progression</p>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-700">
                                {progress.completed_steps}/{progress.total_steps} étapes terminées
                            </p>
                            <p className="text-sm font-black text-[#1D9E75]">{progress.percent}%</p>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#1D9E75] to-emerald-400 rounded-full transition-all duration-500"
                                style={{ width: `${progress.percent}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Visites du traitement</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Chaque visite est planifiée sur un créneau disponible
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingStep(null);
                                        setShowStepModal(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1D9E75] hover:bg-[#168a65] text-white text-xs font-bold rounded-xl transition-all"
                                >
                                    <Plus size={14} />
                                    Ajouter
                                </button>
                            </div>

                            {steps.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-sm font-medium">Aucune étape ajoutée.</p>
                                    <p className="text-xs mt-1">Ajoutez la première étape du traitement.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {steps.map((step, index) => {
                                        const stepCfg = STEP_STATUS[step.status];
                                        return (
                                            <div
                                                key={step.id}
                                                className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50 transition-colors"
                                            >
                                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                                    <div
                                                        className={`size-9 rounded-full flex items-center justify-center shrink-0 ${
                                                            step.status === 'completed'
                                                                ? 'bg-emerald-50'
                                                                : 'bg-gray-50'
                                                        } ${stepCfg.color}`}
                                                    >
                                                        {stepCfg.icon}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {index + 1}. {step.title}
                                                        </p>
                                                        {step.description && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {step.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {fmtDate(step.scheduled_date || step.appointment?.appointment_date)}
                                                            </span>
                                                            {(step.scheduled_time || step.appointment?.start_time) && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={12} />
                                                                    {normalizeTime(step.scheduled_time || step.appointment?.start_time)}
                                                                </span>
                                                            )}
                                                            <span
                                                                className={`font-semibold ${stepCfg.color}`}
                                                            >
                                                                {stepCfg.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {step.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleMarkCompleted(step)}
                                                            disabled={stepLoading}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                                                        >
                                                            <CheckCircle2 size={13} />
                                                            Terminer
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setEditingStep(step);
                                                            setShowStepModal(true);
                                                        }}
                                                        className="size-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    {confirmDeleteStep === step.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleDeleteStep(step.id)}
                                                                className="px-2 py-1 text-[11px] font-bold text-white bg-red-500 rounded-lg"
                                                            >
                                                                Oui
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmDeleteStep(null)}
                                                                className="px-2 py-1 text-[11px] font-bold text-gray-500 border border-gray-200 rounded-lg"
                                                            >
                                                                Non
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmDeleteStep(step.id)}
                                                            className="size-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <User size={16} className="text-[#1D9E75]" />
                                Patient
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-full bg-gradient-to-br from-[#1D9E75] to-emerald-600 flex items-center justify-center text-white font-bold">
                                    {treatment.patient?.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">
                                        {treatment.patient?.name || `Patient #${treatment.patient_id}`}
                                    </p>
                                    {treatment.patient?.phone && (
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                            <Phone size={11} /> {treatment.patient.phone}
                                        </p>
                                    )}
                                    {treatment.patient?.email && (
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Mail size={11} /> {treatment.patient.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Stethoscope size={16} className="text-[#1D9E75]" />
                                Médecin
                            </h3>
                            <p className="text-sm font-semibold text-gray-800">
                                {treatment.doctor?.name || '—'}
                            </p>
                            {treatment.doctor?.speciality && (
                                <p className="text-xs text-gray-500">{treatment.doctor.speciality}</p>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Banknote size={16} className="text-[#1D9E75]" />
                                Résumé financier
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Coût total</span>
                                    <span className="font-bold text-gray-900">
                                        {treatment.total_cost > 0
                                            ? `${treatment.total_cost.toLocaleString('fr-DZ')} DA`
                                            : '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Date de début</span>
                                    <span className="font-semibold text-gray-700">
                                        {fmtDate(treatment.start_date)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Date de fin</span>
                                    <span className="font-semibold text-gray-700">
                                        {fmtDate(treatment.end_date)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TreatmentStepModal
                isOpen={showStepModal}
                onClose={() => {
                    setShowStepModal(false);
                    setEditingStep(null);
                }}
                onSave={handleSaveStep}
                step={editingStep}
                loading={stepLoading}
            />

            {confirmDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Supprimer le traitement ?</h3>
                        <p className="text-sm text-gray-500">
                            Cette action est irréversible. Toutes les étapes seront supprimées.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" fullWidth onClick={() => setConfirmDelete(false)}>
                                Annuler
                            </Button>
                            <Button variant="danger" fullWidth loading={deleting} onClick={handleDeleteTreatment}>
                                Supprimer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DoctorLayout>
    );
}
