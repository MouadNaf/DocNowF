import React, { useState } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppointments } from '@/shared/api/hooks';
import { mockPatients } from '@/lib/mock/auth.mock'; 

export function DoctorConsultationPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { appointments, loading, changeStatus } = useAppointments(false);
    
    const [notes, setNotes] = useState('');
    const [prescription, setPrescription] = useState('');

    const appointment = appointments.find(a => a.id === id);
    const patient = mockPatients.find(p => p.id === appointment?.patientId);

    if (loading) return <DoctorLayout><div className="p-8">Loading consultation details...</div></DoctorLayout>;
    if (!appointment || !patient) return <DoctorLayout><div className="p-8">Appointment not found</div></DoctorLayout>;

    const handleComplete = async () => {
        await changeStatus(appointment.id, 'completed');
        navigate('/doctor/dashboard');
    };

    const handleNoShow = async () => {
        await changeStatus(appointment.id, 'no_show');
        navigate('/doctor/dashboard');
    };

    return (
        <DoctorLayout>
            <div className="flex gap-4 items-center mb-6">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 font-medium">← Back</button>
                <h2 className="text-2xl font-bold text-gray-900">Consultation</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Patient Info</h3>
                        <div className="space-y-3">
                            <p className="text-sm"><span className="text-gray-500">Name:</span> <span className="font-semibold">{patient.name}</span></p>
                            <p className="text-sm"><span className="text-gray-500">Phone:</span> <span className="font-semibold">{patient.phone}</span></p>
                            <p className="text-sm"><span className="text-gray-500">Total Visits:</span> <span className="font-semibold">{patient.totalVisits}</span></p>
                            <p className="text-sm"><span className="text-gray-500">Last Visit:</span> <span className="font-semibold">{patient.lastVisit || 'N/A'}</span></p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Appointment Info</h3>
                        <div className="space-y-3">
                            <p className="text-sm"><span className="text-gray-500">Date/Time:</span> <span className="font-semibold">{appointment.date} at {appointment.time}</span></p>
                            <p className="text-sm capitalize"><span className="text-gray-500">Type:</span> <span className="font-semibold">{appointment.visitType.replace('_', ' ')}</span></p>
                            <p className="text-sm"><span className="text-gray-500">Fee:</span> <span className="font-semibold">{appointment.consultationFee} DZD</span></p>
                            <p className="text-sm capitalize"><span className="text-gray-500">Payment:</span> <span className="font-semibold">{appointment.paymentStatus}</span></p>
                        </div>
                    </div>
                </div>

                {/* Right side: Input */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Medical Record</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Diagnosis</label>
                                <textarea 
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={4}
                                    placeholder="Enter consultation notes..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prescription</label>
                                <textarea 
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={4}
                                    placeholder="Add medication details..."
                                    value={prescription}
                                    onChange={(e) => setPrescription(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button 
                                onClick={handleComplete}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                            >
                                Mark Completed
                            </button>
                            <button 
                                onClick={handleNoShow}
                                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 px-6 rounded-xl transition-colors"
                            >
                                Mark No-show
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
}
