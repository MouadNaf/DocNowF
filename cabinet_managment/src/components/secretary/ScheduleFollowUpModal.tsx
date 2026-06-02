import React, { useEffect, useMemo, useState } from 'react';
import { X, Calendar, Clock, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import * as secretaryApi from '@/lib/api/secretary';
import type { TreatmentStep } from '@/entities/treatment';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: { date: string; time: string; notes?: string; title?: string }) => Promise<void>;
    step?: TreatmentStep | null;
    loading?: boolean;
}

export function ScheduleFollowUpModal({ isOpen, onClose, onSave, step, loading }: Props) {
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const { data: slotsData, isLoading: slotsLoading } = useQuery({
        queryKey: ['secretary', 'walk-in-slots', scheduledDate],
        queryFn: () => secretaryApi.getWalkInSlots(scheduledDate),
        enabled: !!scheduledDate && isOpen,
    });

    const slots = slotsData?.slots ?? [];
    const availableSlots = useMemo(() => slots.filter((s: { is_available: boolean }) => s.is_available), [slots]);

    useEffect(() => {
        if (!isOpen) return;
        if (step) {
            setScheduledDate(step.scheduled_date || step.appointment?.appointment_date || '');
            setScheduledTime((step.scheduled_time || step.appointment?.start_time || '').slice(0, 5));
            setNotes(step.description || '');
        } else {
            setScheduledDate('');
            setScheduledTime('');
            setNotes('');
        }
        setError('');
    }, [step, isOpen]);

    useEffect(() => {
        if (!scheduledDate || slotsLoading) return;
        if (availableSlots.length > 0) {
            if (!scheduledTime || !availableSlots.some((s: { start: string }) => s.start === scheduledTime)) {
                setScheduledTime(availableSlots[0].start);
            }
        } else {
            setScheduledTime('');
        }
    }, [scheduledDate, slots, slotsLoading, availableSlots, scheduledTime]);

    const handleClose = () => {
        setError('');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scheduledDate || !scheduledTime) {
            setError('Veuillez sélectionner une date et un créneau.');
            return;
        }
        setError('');
        try {
            await onSave({
                date: scheduledDate,
                time: scheduledTime,
                notes: notes.trim() || undefined,
                title: step ? undefined : 'Visite de suivi',
            });
            handleClose();
        } catch (err: any) {
            setError(
                err?.response?.data?.errors?.scheduled_time?.[0] ||
                    err?.response?.data?.message ||
                    'Impossible de planifier la visite.',
            );
        }
    };

    if (!isOpen) return null;

    const allPastOrFull = slots.length > 0 && availableSlots.length === 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between rounded-t-3xl z-10">
                    <div>
                        <h2 className="text-lg font-black text-gray-900">
                            {step ? 'Reprogrammer la visite' : 'Planifier une visite de suivi'}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Choisissez une date et un créneau disponible
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="size-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600"
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

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600 flex items-center gap-1.5">
                            <Calendar size={13} />
                            Date de la visite *
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
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {slotsLoading ? (
                                        <div className="col-span-full text-center text-sm text-gray-400 py-4">
                                            Recherche de créneaux...
                                        </div>
                                    ) : availableSlots.length > 0 ? (
                                        availableSlots.map((slot: { start: string }) => (
                                            <button
                                                key={slot.start}
                                                type="button"
                                                onClick={() => setScheduledTime(slot.start)}
                                                className={[
                                                    'py-2.5 rounded-xl text-xs font-bold border transition-all',
                                                    scheduledTime === slot.start
                                                        ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#1D9E75]/40',
                                                ].join(' ')}
                                            >
                                                {slot.start}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center text-xs text-gray-400 py-3">
                                            {allPastOrFull
                                                ? 'Aucun créneau disponible ce jour.'
                                                : 'Aucun créneau — vérifiez le planning du médecin.'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            placeholder="Notes administratives..."
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 text-sm resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 h-11 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-11 bg-[#1D9E75] hover:bg-[#168a65] text-white rounded-xl text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-1"
                        >
                            {loading ? 'Enregistrement...' : (
                                <>Enregistrer <ChevronRight size={14} /></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
