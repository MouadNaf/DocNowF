import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usePatients, useCreateTreatment } from '@/shared/api/hooks';
import type { CreateTreatmentPayload } from '@/entities/treatment';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export function CreateTreatmentModal({ isOpen, onClose, onCreated }: Props) {
    const { patients, loading: patientsLoading } = usePatients();
    const { create, loading } = useCreateTreatment();

    const [patientId, setPatientId] = useState('');
    const [title, setTitle] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [description, setDescription] = useState('');
    const [totalCost, setTotalCost] = useState('');
    const [startDate, setStartDate] = useState('');
    const [error, setError] = useState('');

    const reset = () => {
        setPatientId('');
        setTitle('');
        setDiagnosis('');
        setDescription('');
        setTotalCost('');
        setStartDate('');
        setError('');
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientId || !title.trim()) {
            setError('Veuillez sélectionner un patient et saisir un titre.');
            return;
        }

        setError('');
        const payload: CreateTreatmentPayload = {
            patient_id: patientId,
            title: title.trim(),
            diagnosis: diagnosis.trim() || undefined,
            description: description.trim() || undefined,
            total_cost: totalCost ? Number(totalCost) : undefined,
            start_date: startDate || undefined,
        };

        try {
            await create(payload);
            reset();
            onCreated();
            onClose();
        } catch {
            setError('Impossible de créer le traitement. Veuillez réessayer.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between rounded-t-3xl">
                    <div>
                        <h2 className="text-lg font-black text-gray-900">Nouveau traitement</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Créer un plan de traitement pour un patient</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="size-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">Patient *</label>
                        <select
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            disabled={patientsLoading}
                            className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 text-sm bg-white"
                        >
                            <option value="">Sélectionner un patient</option>
                            {patients.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Titre *"
                        placeholder="Ex: Traitement canal radiculaire"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <Input
                        label="Diagnostic"
                        placeholder="Diagnostic médical"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                    />

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Description du traitement..."
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 text-sm resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Coût total (DA)"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0"
                            value={totalCost}
                            onChange={(e) => setTotalCost(e.target.value)}
                        />
                        <Input
                            label="Date de début"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" fullWidth onClick={handleClose}>
                            Annuler
                        </Button>
                        <Button type="submit" fullWidth loading={loading}>
                            Créer le traitement
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
