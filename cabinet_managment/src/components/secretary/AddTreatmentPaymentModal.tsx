import React, { useState } from 'react';
import { X, Banknote } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: {
        amount: number;
        payment_method: 'cash' | 'card' | 'bank_transfer';
        notes?: string;
    }) => Promise<void>;
    remainingBalance: number;
    loading?: boolean;
}

const METHODS = [
    { value: 'cash' as const, label: 'Espèces' },
    { value: 'card' as const, label: 'Carte' },
    { value: 'bank_transfer' as const, label: 'Virement bancaire' },
];

export function AddTreatmentPaymentModal({ isOpen, onClose, onSave, remainingBalance, loading }: Props) {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleClose = () => {
        setAmount('');
        setMethod('cash');
        setNotes('');
        setError('');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = parseFloat(amount);
        if (!parsed || parsed <= 0) {
            setError('Veuillez entrer un montant valide.');
            return;
        }
        if (remainingBalance > 0 && parsed > remainingBalance) {
            setError(`Le montant ne peut pas dépasser ${remainingBalance.toLocaleString('fr-DZ')} DA.`);
            return;
        }
        setError('');
        try {
            await onSave({
                amount: parsed,
                payment_method: method,
                notes: notes.trim() || undefined,
            });
            handleClose();
        } catch (err: any) {
            setError(
                err?.response?.data?.errors?.amount?.[0] ||
                    err?.response?.data?.message ||
                    'Impossible d\'enregistrer le paiement.',
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Banknote size={20} className="text-[#1D9E75]" />
                        <h2 className="text-lg font-bold text-gray-900">Enregistrer un paiement</h2>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    <p className="text-sm text-gray-500">
                        Solde restant :{' '}
                        <span className="font-bold text-gray-900">
                            {remainingBalance.toLocaleString('fr-DZ')} DA
                        </span>
                    </p>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">Montant (DA) *</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Ex: 5000"
                            className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 text-sm"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">Mode de paiement *</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value as typeof method)}
                            className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 text-sm"
                        >
                            {METHODS.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 text-sm resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 h-11 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-11 bg-[#1D9E75] text-white rounded-xl text-sm font-bold disabled:opacity-60"
                        >
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
