import React, { useMemo } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { useAppointments } from '@/shared/api/hooks';
import { StatCard } from '@/components/ui/StatCard';
import { DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';

export function DoctorAccountingPage() {
    const { appointments, loading } = useAppointments(false);

    const { totalExpected, totalPaid, totalUnpaid } = useMemo(() => {
        let expected = 0;
        let paid = 0;
        let unpaid = 0;

        appointments.forEach(apt => {
            expected += apt.consultationFee;
            if (apt.paymentStatus === 'paid') {
                paid += apt.consultationFee;
            } else {
                unpaid += apt.consultationFee;
            }
        });

        return { totalExpected: expected, totalPaid: paid, totalUnpaid: unpaid };
    }, [appointments]);

    return (
        <DoctorLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Accounting & Revenue</h2>
                    <p className="text-gray-500">Track your consultation fees and payment statuses.</p>
                </div>

                {loading ? (
                    <div className="p-4 text-center">Loading accounting data...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard 
                                title="Expected Total Revenue" 
                                value={`${totalExpected} DZD`} 
                                icon={<DollarSign size={24} />} 
                                iconBgClass="bg-blue-50"
                                iconColorClass="text-blue-500"
                            />
                            <StatCard 
                                title="Total Paid" 
                                value={`${totalPaid} DZD`} 
                                icon={<CheckCircle2 size={24} />} 
                                iconBgClass="bg-green-50"
                                iconColorClass="text-green-600"
                            />
                            <StatCard 
                                title="Pending (Unpaid)" 
                                value={`${totalUnpaid} DZD`} 
                                icon={<AlertCircle size={24} />} 
                                iconBgClass="bg-yellow-50"
                                iconColorClass="text-yellow-500"
                            />
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Payment History</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {appointments.map((apt) => (
                                            <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    {apt.date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {apt.patientId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    {apt.consultationFee} DZD
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${apt.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {apt.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {apt.paidAt ? new Date(apt.paidAt).toLocaleDateString() : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DoctorLayout>
    );
}
