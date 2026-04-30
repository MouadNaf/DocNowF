import React, { useState, useEffect } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppointmentDetails, useSaveConsultation } from '@/shared/api/hooks';
import { updateAppointmentStatus, setAppointmentPrice } from '@/shared/api/doctor.api';
import { Clock, User, Phone, Calendar, ClipboardList, CheckCircle, XCircle } from 'lucide-react';

export function DoctorConsultationPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, loading } = useAppointmentDetails(id);
    const { save, loading: saving } = useSaveConsultation();
    
    const [notes, setNotes] = useState('');
    const [prescription, setPrescription] = useState('');
    const [price, setPrice] = useState<string>('');

    // Update price state when data loads
    useEffect(() => {
        if (data?.appointment?.consultationFee) {
            setPrice(data.appointment.consultationFee.toString());
        }
    }, [data]);

    if (loading) return (
        <DoctorLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
                <div className="animate-spin h-10 w-10 border-4 border-[#1D9E75] border-t-transparent rounded-full mb-4" />
                Chargement de la consultation...
            </div>
        </DoctorLayout>
    );

    if (!data?.appointment || !data?.patient) return (
        <DoctorLayout>
            <div className="p-8 text-center text-red-500 font-bold">Rendez-vous introuvable</div>
        </DoctorLayout>
    );

    const { appointment, patient } = data;

    const handleComplete = async () => {
        if (!notes.trim()) {
            alert('Veuillez saisir des notes ou un diagnostic avant de terminer.');
            return;
        }

        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0) {
            alert('Veuillez saisir un prix valide.');
            return;
        }

        try {
            // Set price then save consultation
            await setAppointmentPrice(appointment.id, priceNum);
            await save(appointment.id, { diagnosis: notes, prescription: prescription });
            navigate('/doctor/dashboard');
        } catch (err) {
            console.error("Erreur lors de la sauvegarde:", err);
            alert("Une erreur est survenue lors de la sauvegarde.");
        }
    };

    const handleNoShow = async () => {
        if (confirm('Marquer ce patient comme absent ?')) {
            await updateAppointmentStatus(appointment.id, 'no_show');
            navigate('/doctor/dashboard');
        }
    };

    return (
        <DoctorLayout>
            <div className="flex gap-4 items-center mb-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
                >
                    ← Retour
                </button>
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Consultation Médicale</h2>
                    <p className="text-sm text-gray-500">ID Rendez-vous: #{appointment.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#1D9E75]"></div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <User size={20} className="text-[#1D9E75]" />
                            Infos Patient
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                <span className="text-xs font-bold text-gray-400 uppercase">Nom</span>
                                <span className="font-bold text-gray-800">{patient.name}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                <span className="text-xs font-bold text-gray-400 uppercase">Téléphone</span>
                                <span className="font-bold text-gray-800">{patient.phone}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                <span className="text-xs font-bold text-gray-400 uppercase">Visites totales</span>
                                <span className="px-3 py-1 bg-teal-50 text-[#1D9E75] rounded-full text-xs font-black">
                                    {patient.totalVisits}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase">Dernière visite</span>
                                <span className="font-bold text-gray-600">{patient.lastVisit || 'Première fois'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar size={20} className="text-blue-500" />
                            Rendez-vous
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-50 rounded-2xl flex items-center gap-3">
                                <Clock className="text-blue-500" size={18} />
                                <div>
                                    <p className="text-xs text-blue-600 font-bold">Heure prévue</p>
                                    <p className="text-sm font-black text-blue-900">{appointment.time}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase">Type</span>
                                <span className="text-sm font-bold text-gray-700 capitalize">{appointment.visitType?.replace('_', ' ') || 'Consultation'}</span>
                            </div>
                        </div>
                    </div>

                    {patient.history?.length > 0 && (
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ClipboardList size={18} className="text-orange-500" />
                                Historique Récent
                            </h3>
                            <div className="space-y-3">
                                {patient.history.slice(0, 3).map((h: any) => (
                                    <div key={h.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{h.record_date}</p>
                                        <p className="text-xs font-bold text-gray-800 line-clamp-2">{h.diagnosis}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side: Input */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <ClipboardList size={18} className="text-[#1D9E75]" />
                                    Observations & Diagnostic
                                </label>
                                <textarea 
                                    className="w-full border-2 border-gray-50 rounded-2xl p-4 focus:ring-4 focus:ring-[#1D9E75]/10 focus:border-[#1D9E75] outline-none transition-all min-h-[160px] text-gray-800"
                                    placeholder="Décrivez les symptômes, observations et le diagnostic final..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <CheckCircle size={18} className="text-blue-500" />
                                    Ordonnance / Traitement
                                </label>
                                <textarea 
                                    className="w-full border-2 border-gray-50 rounded-2xl p-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all min-h-[160px] text-gray-800"
                                    placeholder="Détails des médicaments, dosages et durée..."
                                    value={prescription}
                                    onChange={(e) => setPrescription(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="pt-4 border-t border-gray-50">
                                <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2">
                                    <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg">
                                        <span className="font-bold text-base">DZ</span>
                                    </div>
                                    Prix de la consultation (DZD)
                                </label>
                                <input 
                                    type="number"
                                    className="w-full md:w-48 border-2 border-gray-50 rounded-2xl p-4 focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 outline-none transition-all text-xl font-black text-gray-900"
                                    placeholder="0.00"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Le prix sera visible par la secrétaire pour le paiement.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={handleComplete}
                                disabled={saving}
                                className="flex-1 bg-[#1D9E75] hover:bg-[#168a65] text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-[#1D9E75]/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {saving ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <><CheckCircle size={22} /> Terminer la consultation</>}
                            </button>
                            <button 
                                onClick={handleNoShow}
                                className="px-8 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                            >
                                <XCircle size={22} /> Patient Absent
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
}
