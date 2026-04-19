import React from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Calendar, Users, XCircle, DollarSign } from 'lucide-react';
import { useDashboardStats, useAppointments } from '@/shared/api/hooks';
import { useNavigate } from 'react-router-dom';

export function DoctorDashboardPage() {
    const { data: stats, loading: statsLoading } = useDashboardStats();
    const { appointments, loading: aptsLoading } = useAppointments(true); // filterByToday = true
    const navigate = useNavigate();

    return (
        <DoctorLayout>
            {statsLoading ? (
                <div className="flex justify-center p-8"><p>Loading stats...</p></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                        title="Today's Appointments" 
                        value={stats?.todayAppointments.toString() || '0'} 
                        icon={<Calendar size={24} />} 
                        iconBgClass="bg-blue-50"
                        iconColorClass="text-blue-500"
                    />
                    <StatCard 
                        title="Total Patients" 
                        value={stats?.totalPatients.toString() || '0'} 
                        icon={<Users size={24} />} 
                        iconBgClass="bg-teal-50"
                        iconColorClass="text-teal-600"
                    />
                    <StatCard 
                        title="No-Shows" 
                        value={stats?.noShows.toString() || '0'} 
                        icon={<XCircle size={24} />} 
                        iconBgClass="bg-red-50"
                        iconColorClass="text-red-500"
                    />
                    <StatCard 
                        title="Revenue Today" 
                        value={`${stats?.revenueToday || 0} DZD`} 
                        icon={<DollarSign size={24} />} 
                        iconBgClass="bg-green-50"
                        iconColorClass="text-green-500"
                    />
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Today's Appointments</h3>
                    <span className="bg-blue-50 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full border border-blue-100">
                        {appointments.length} Total
                    </span>
                </div>

                {aptsLoading ? (
                    <div className="flex justify-center p-4"><p>Loading appointments...</p></div>
                ) : appointments.length === 0 ? (
                    <div className="flex justify-center p-4 text-gray-500"><p>No appointments today.</p></div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((apt) => {
                            const getStatusColor = (status: string) => {
                                switch(status) {
                                  case 'confirmed': return 'bg-blue-100 text-blue-700';
                                  case 'completed': return 'bg-green-100 text-green-700';
                                  case 'no_show': return 'bg-red-100 text-red-700';
                                  case 'arrived': return 'bg-yellow-100 text-yellow-700';
                                  default: return 'bg-gray-100 text-gray-700';
                                }
                            };

                            const getPaymentColor = (status: string) => status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';

                            return (
                                <div 
                                  key={apt.id} 
                                  onClick={() => navigate(`/doctor/consultation/${apt.id}`)}
                                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="text-center w-16">
                                            <p className="text-lg font-bold text-gray-900">{apt.time}</p>
                                        </div>
                                        <div className="h-10 w-px bg-gray-200"></div>
                                        <div>
                                            <p className="text-base font-bold text-gray-900">{apt.patientId}</p> {/* Would join with patient name in real app */}
                                            <p className="text-sm font-medium text-gray-500 capitalize">{apt.visitType.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${getStatusColor(apt.status)} capitalize`}>
                                            {apt.status.replace('_', ' ')}
                                        </span>
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${getPaymentColor(apt.paymentStatus)} capitalize`}>
                                            {apt.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </DoctorLayout>
    );
}