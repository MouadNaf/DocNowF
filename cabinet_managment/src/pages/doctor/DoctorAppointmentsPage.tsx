import React, { useState } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { useAppointments } from '@/shared/api/hooks';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Filter, X, ChevronRight, User, Clock, CheckCircle } from 'lucide-react';

export function DoctorAppointmentsPage() {
    const [search, setSearch] = useState('');
    const [date, setDate] = useState('');
    const [status, setStatus] = useState('');

    const { appointments, loading } = useAppointments({ 
        patient: search, 
        date: date || undefined,
        status: status || undefined
    });
    const navigate = useNavigate();

    const resetFilters = () => {
        setSearch('');
        setDate('');
        setStatus('');
    };

    return (
        <DoctorLayout>
            <div className="space-y-6">
                {/* Header & Filters */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Tous les Rendez-vous</h2>
                            <p className="text-sm text-gray-500">Gérez et consultez l'historique complet de vos patients.</p>
                        </div>
                        <div className="bg-[#f0f9f6] text-[#1D9E75] text-xs font-black px-4 py-2 rounded-full border border-[#d1e9e0] uppercase tracking-wider">
                            {appointments.length} Total
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Rechercher par nom ou téléphone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 border-2 border-gray-50 rounded-2xl focus:border-[#1D9E75] focus:ring-0 text-sm transition-all bg-gray-50/50"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 border-2 border-gray-50 rounded-2xl focus:border-[#1D9E75] focus:ring-0 text-sm transition-all bg-gray-50/50"
                            />
                        </div>
                        <button 
                            onClick={resetFilters}
                            className="h-12 flex items-center justify-center gap-2 text-gray-500 font-bold text-sm hover:text-red-500 transition-colors"
                        >
                            <X size={18} />
                            Réinitialiser
                        </button>
                    </div>
                </div>

                {/* Results List */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="animate-spin h-8 w-8 border-4 border-[#1D9E75] border-t-transparent rounded-full mb-4" />
                            Chargement...
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="text-center py-12 space-y-4">
                            <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                <Search size={24} className="text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">Aucun rendez-vous trouvé.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {appointments.map((apt) => {
                                const getStatusColor = (status: string) => {
                                    switch(status) {
                                      case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
                                      case 'completed': return 'bg-emerald-50 text-[#1D9E75] border-emerald-100';
                                      case 'no_show': return 'bg-red-50 text-red-600 border-red-100';
                                      case 'arrived': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
                                      default: return 'bg-gray-50 text-gray-600 border-gray-100';
                                    }
                                };

                                return (
                                    <div 
                                      key={apt.id} 
                                      onClick={() => navigate(`/doctor/consultation/${apt.id}`)}
                                      className="group flex flex-col md:flex-row items-center justify-between p-6 rounded-3xl bg-white border-2 border-gray-50 hover:border-[#1D9E75]/30 hover:bg-[#f9fefd] cursor-pointer transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-8 w-full md:w-auto">
                                            <div className="text-center min-w-[100px] p-3 bg-gray-50 rounded-2xl group-hover:bg-white transition-colors">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{apt.appointment_date}</p>
                                                <p className="text-xl font-black text-gray-900 flex items-center justify-center gap-1">
                                                    <Clock size={16} className="text-[#1D9E75]" />
                                                    {apt.start_time}
                                                </p>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-2xl bg-[#f0f9f6] text-[#1D9E75] flex items-center justify-center font-black text-lg">
                                                    {apt.patient?.name?.charAt(0) || <User size={20} />}
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-gray-900 group-hover:text-[#1D9E75] transition-colors">
                                                        {apt.patient?.name || `Patient #${apt.patient_id}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto justify-end">
                                            <span className={`text-[10px] font-black px-4 py-2 rounded-full border uppercase tracking-widest ${getStatusColor(apt.status)}`}>
                                                {apt.status.replace('_', ' ')}
                                            </span>
                                            <div className="size-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#1D9E75] group-hover:text-white transition-all">
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DoctorLayout>
    );
}
