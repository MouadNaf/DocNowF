import React, { useEffect, useMemo, useState } from 'react';
import { X, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useWalkInSlots } from '@/shared/api/hooks';
import type { TreatmentStep, CreateTreatmentStepPayload, UpdateTreatmentStepPayload } from '@/entities/treatment';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: CreateTreatmentStepPayload | UpdateTreatmentStepPayload) => Promise<void>;
    step?: TreatmentStep | null;
    loading?: boolean;
}

const normalizeTime = (time?: string) => (time ? time.slice(0, 5) : '');

export function TreatmentStepModal({ isOpen, onClose, onSave, step, loading }: Props) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [error, setError] = useState('');

    const excludeAppointmentId = step?.appointment_id ?? undefined;
    const { slots, loading: slotsLoading, message: slotsMessage } = useWalkInSlots(
        scheduledDate,
        excludeAppointmentId,
    );

    const availableSlots = useMemo(
        () => slots.filter((s) => s.is_available),
        [slots],
    );

    useEffect(() => {
        if (step) {
            setTitle(step.title);
            setDescription(step.description || '');
            setScheduledDate(step.scheduled_date || step.appointment?.appointment_date || '');
            setScheduledTime(
                normalizeTime(step.scheduled_time || step.appointment?.start_time),
            );
        } else {
            setTitle('');
            setDescription('');
            setScheduledDate('');
            setScheduledTime('');
        }
        setError('');
    }, [step, isOpen]);

    useEffect(() => {
        if (!scheduledDate || slotsLoading) return;
        if (availableSlots.length > 0) {
            if (!scheduledTime || !availableSlots.some((s) => s.start === scheduledTime)) {
                setScheduledTime(availableSlots[0].start);
            }
        } else {
            setScheduledTime('');
        }
    }, [scheduledDate, slots, slotsLoading]);

    const handleClose = () => {
        setError('');
        onClose();
    };

    const goToNextDay = () => {
        const d = new Date(scheduledDate);
        d.setDate(d.getDate() + 1);
        setScheduledDate(d.toISOString().split('T')[0]);
        setScheduledTime('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Le titre est obligatoire.');
            return;
        }

        if (scheduledDate && !scheduledTime) {
            setError('Veuillez sélectionner un créneau horaire disponible.');
            return;
        }

        setError('');
        try {
            await onSave({
                title: title.trim(),
                description: description.trim() || undefined,
                scheduled_date: scheduledDate || undefined,
                scheduled_time: scheduledTime || undefined,
            });
            handleClose();
        } catch (err: any) {
            const apiError =
                err?.response?.data?.errors?.scheduled_time?.[0] ||
                err?.response?.data?.message ||
                'Impossible d\'enregistrer l\'étape. Veuillez réessayer.';
            setError(apiError);
        }
    };

    if (!isOpen) return null;

    const allPastOrFull = slots.length > 0 && availableSlots.length === 0;
    const noScheduleDay = !slotsLoading && slots.length === 0 && !!scheduledDate;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between rounded-t-3xl z-10">
                    <div>
                        <h2 className="text-lg font-black text-gray-900">
                            {step ? 'Modifier la visite' : 'Planifier une visite'}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Choisissez une date et un créneau compatible avec votre planning
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="size-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Titre de la visite *"
                        placeholder="Ex: Visite 1 — Examen initial"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            placeholder="Détails de la visite..."
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 text-sm resize-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600 flex items-center gap-1.5">
                            <Calendar size={13} />
                            Date de la visite
                        </label>
                        <input
                            type="date"
                            value={scheduledDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                                setScheduledDate(e.target.value);
                                setScheduledTime('');
                            }}
                            className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 text-sm"
                        />
                    </div>

                    {scheduledDate && (
                        <div className="space-y-3">
                            <label className="block text-xs font-medium text-gray-600 flex items-center gap-1.5">
                                <Clock size={13} />
                                Créneau horaire *
                            </label>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {!slotsLoading && slots.length > 0 && (
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-xs text-gray-400">
                                            {availableSlots.length > 0 ? (
                                                <span className="text-[#1D9E75] font-semibold">
                                                    {availableSlots.length} créneau
                                                    {availableSlots.length > 1 ? 'x' : ''} disponible
                                                    {availableSlots.length > 1 ? 's' : ''}
                                                </span>
                                            ) : (
                                                <span className="text-orange-500 font-semibold">
                                                    Aucun créneau disponible
                                                </span>
                                            )}
                                        </span>
                                        {allPastOrFull && (
                                            <button
                                                type="button"
                                                onClick={goToNextDay}
                                                className="flex items-center gap-1 text-xs text-[#1D9E75] font-semibold hover:underline"
                                            >
                                                Essayer le lendemain <ChevronRight size={14} />
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {slotsLoading ? (
                                        <div className="col-span-full text-center text-sm text-gray-400 py-4 flex flex-col items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
                                            Recherche de créneaux...
                                        </div>
                                    ) : availableSlots.length > 0 ? (
                                        availableSlots.map((slot) => (
                                            <button
                                                key={slot.start}
                                                type="button"
                                                onClick={() => setScheduledTime(slot.start)}
                                                className={[
                                                    'py-2.5 rounded-xl text-xs font-bold border transition-all',
                                                    scheduledTime === slot.start
                                                        ? 'bg-[#1D9E75] text-white border-[#1D9E75] shadow-sm'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#1D9E75]/40',
                                                ].join(' ')}
                                            >
                                                {slot.start}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center text-xs text-gray-400 py-3">
                                            {slotsMessage ||
                                                (noScheduleDay
                                                    ? 'Aucun créneau ce jour. Vérifiez votre planning.'
                                                    : 'Sélectionnez une date pour voir les créneaux.')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400">
                                Seuls les créneaux libres sont proposés — un autre patient ne peut pas
                                réserver le même horaire.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" fullWidth onClick={handleClose}>
                            Annuler
                        </Button>
                        <Button type="submit" fullWidth loading={loading}>
                            {step ? 'Enregistrer' : 'Planifier la visite'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
