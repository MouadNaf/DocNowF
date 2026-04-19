import React, { useMemo } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { useAppointments } from '@/shared/api/hooks';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export function DoctorStatisticsPage() {
    const { appointments, loading } = useAppointments(false);

    const { statusData, revenueData } = useMemo(() => {
        const statuses = { confirmed: 0, arrived: 0, completed: 0, no_show: 0 };
        const revenueByDate: Record<string, number> = {};

        appointments.forEach(apt => {
            if (statuses[apt.status] !== undefined) {
                statuses[apt.status]++;
            }
            if (apt.paymentStatus === 'paid') {
                revenueByDate[apt.date] = (revenueByDate[apt.date] || 0) + apt.consultationFee;
            }
        });

        const statusChart = [
            { name: 'Completed', value: statuses.completed, color: '#22c55e' },
            { name: 'Confirmed', value: statuses.confirmed, color: '#3b82f6' },
            { name: 'No Show', value: statuses.no_show, color: '#ef4444' },
            { name: 'Arrived', value: statuses.arrived, color: '#eab308' },
        ];

        // Sort dates chronologically for the bar chart
        const revChart = Object.keys(revenueByDate).sort().map(date => ({
            date: date.substring(5), // Just MM-DD for display
            revenue: revenueByDate[date]
        }));

        return { statusData: statusChart.filter(s => s.value > 0), revenueData: revChart };
    }, [appointments]);

    return (
        <DoctorLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Statistics & Insights</h2>
                    <p className="text-gray-500">Visual overview of your clinic's performance.</p>
                </div>

                {loading ? (
                    <div className="p-4 text-center">Loading charts...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Appointment Statuses</h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Over Time (DZD)</h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip cursor={{fill: '#f3f4f6'}} />
                                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DoctorLayout>
    );
}
