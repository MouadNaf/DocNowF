import React, { useState } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { usePatients } from '@/shared/api/hooks';
import { Search, User, MapPin, Calendar, MoreVertical, ChevronRight, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DoctorPatientsPage() {
    const { patients, loading } = usePatients();
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const filtered = patients.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) || 
        p.phone?.includes(search)
    );

    return (
        <DoctorLayout>
            <div className="space-y-6">
                {/* Header & Search */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Annuaire des Patients</h2>
                            <p className="text-sm text-gray-500">Consultez et gérez les dossiers de vos patients.</p>
                        </div>
                        <div className="bg-blue-50 text-blue-600 text-xs font-black px-4 py-2 rounded-full border border-blue-100 uppercase tracking-wider">
                            {patients.length} Patients au total
                        </div>
                    </div>
                    
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, téléphone..."
                            className="w-full h-14 pl-12 pr-4 border-2 border-gray-50 rounded-2xl focus:border-[#1D9E75] focus:ring-0 text-sm font-medium transition-all bg-gray-50/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Patient List */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="animate-spin h-8 w-8 border-4 border-[#1D9E75] border-t-transparent rounded-full mb-4" />
                            Chargement des patients...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 space-y-4">
                            <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                <User size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">Aucun patient ne correspond à votre recherche.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-8">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Informations Patient</th>
                                        <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Visites</th>
                                        <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Dernière Consultation</th>
                                        <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map((patient) => (
                                        <tr key={patient.id} className="group hover:bg-[#f9fefd] transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 rounded-2xl bg-[#f0f9f6] text-[#1D9E75] flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform">
                                                        {patient.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-base font-bold text-gray-900 group-hover:text-[#1D9E75] transition-colors">
                                                            {patient.name}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                                                <Phone size={12} /> {patient.phone}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                                                <MapPin size={12} /> {patient.city || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="inline-flex items-center justify-center size-8 bg-teal-50 text-[#1D9E75] rounded-full text-xs font-black border border-teal-100">
                                                    {patient.totalVisits}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                    <Calendar size={14} className="text-[#1D9E75]" />
                                                    {patient.lastVisit || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1D9E75] hover:bg-[#168a65] text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-teal-50/20"
                                                >
                                                    Historique <ChevronRight size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DoctorLayout>
    );
}
