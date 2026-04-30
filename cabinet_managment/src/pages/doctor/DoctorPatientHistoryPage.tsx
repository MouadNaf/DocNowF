import React from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientHistory } from '@/shared/api/hooks';
import { User, Phone, MapPin, Calendar, Clock, ClipboardList, FileText, ChevronLeft, CalendarDays } from 'lucide-react';

export function DoctorPatientHistoryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, loading } = usePatientHistory(id);

    if (loading) return (
        <DoctorLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
                <div className="animate-spin h-10 w-10 border-4 border-[#1D9E75] border-t-transparent rounded-full mb-4" />
                Chargement de l'historique...
            </div>
        </DoctorLayout>
    );

    if (!data) return (
        <DoctorLayout>
            <div className="p-8 text-center text-red-500 font-bold">Patient introuvable</div>
        </DoctorLayout>
    );

    const { patient, history } = data;

    return (
        <DoctorLayout>
            {/* Header */}
            <div className="flex gap-4 items-center mb-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Historique Médical</h2>
                    <p className="text-sm text-gray-500">Dossier complet de l'évolution du patient.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Patient Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm overflow-hidden relative sticky top-8">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#1D9E75]"></div>
                        
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="size-24 rounded-3xl bg-[#f0f9f6] text-[#1D9E75] flex items-center justify-center font-black text-3xl mb-4 border-4 border-white shadow-xl shadow-teal-50">
                                {patient.name.charAt(0)}
                            </div>
                            <h3 className="text-xl font-black text-gray-900">{patient.name}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{patient.gender === 'male' ? 'Homme' : 'Femme'}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Téléphone</p>
                                    <p className="text-sm font-bold text-gray-800">{patient.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ville</p>
                                    <p className="text-sm font-bold text-gray-800">{patient.city || 'Non renseigné'}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-teal-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-[#1D9E75] uppercase mb-1">Visites</p>
                                    <p className="text-2xl font-black text-[#1D9E75]">{history.length}</p>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-blue-500 uppercase mb-1">Statut</p>
                                    <p className="text-xs font-black text-blue-600 uppercase">Actif</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="lg:col-span-2">
                    {history.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                            <ClipboardList size={48} className="text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Aucun historique disponible pour ce patient.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                            {history.map((record: any, index: number) => (
                                <div key={record.id} className="relative pl-16">
                                    {/* Timeline Marker */}
                                    <div className="absolute left-4 top-2 size-4 rounded-full border-4 border-white bg-[#1D9E75] shadow-lg shadow-[#1D9E75]/20 ring-4 ring-teal-50 z-10"></div>
                                    
                                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
                                                    <CalendarDays size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{record.record_date}</p>
                                                    <p className="text-sm font-bold text-gray-900">Consultation #{record.id}</p>
                                                </div>
                                            </div>
                                            {record.appointment && (
                                                <div className="flex items-center gap-3">
                                                    {record.appointment.consultation_fee && (
                                                        <div className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                                            <Clock size={10} /> {record.appointment.consultation_fee} DZD
                                                        </div>
                                                    )}
                                                    <div className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                        Rdv: {record.appointment.appointment_date}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 mb-3">
                                                    <FileText size={16} className="text-[#1D9E75]" />
                                                    DIAGNOSTIC & OBSERVATIONS
                                                </h4>
                                                <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-700 leading-relaxed italic">
                                                    "{record.diagnosis || 'Aucune observation enregistrée.'}"
                                                </div>
                                            </div>

                                            {record.prescription && (
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 mb-3">
                                                        <ClipboardList size={16} className="text-blue-500" />
                                                        ORDONNANCE / TRAITEMENT
                                                    </h4>
                                                    <div className="p-4 bg-blue-50/30 border border-blue-50 rounded-2xl text-sm text-gray-700 leading-relaxed">
                                                        {record.prescription}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DoctorLayout>
    );
}
