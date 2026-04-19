import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { mockPatients, mockAppointments, mockMedicalRecords } from '@/lib/mock/auth.mock';
import { ArrowLeft, User, Calendar, FileText, Pill } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export function DoctorPatientHistoryPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const patient = useMemo(() => mockPatients.find(p => p.id === id), [id]);

    const history = useMemo(() => {
        if (!patient) return [];
        const apts = mockAppointments.filter(a => a.patientId === patient.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return apts.map(apt => {
            const record = mockMedicalRecords.find((mr: any) => mr.appointmentId === apt.id);
            return {
                ...apt,
                record
            };
        });
    }, [patient]);

    if (!patient) return <div className="p-8">Patient not found</div>;

    return (
        <DoctorLayout>
            <div className="space-y-6">
                <button 
                    onClick={() => navigate(ROUTES.DOCTOR_PATIENTS)}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span className="font-semibold">Back to Patients Directory</span>
                </button>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-4 rounded-full">
                            <User className="text-blue-500 w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                            <p className="text-gray-500 font-medium">Patient ID: {patient.id} • Phone: {patient.phone}</p>
                            <p className="text-sm text-gray-400 mt-1">Total Visits: {patient.totalVisits} • Last Visit: {patient.lastVisit || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 px-1">Medical History & Visits</h3>
                    
                    {history.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
                            No visits recorded for this patient yet.
                        </div>
                    ) : (
                        history.map((visit, index) => (
                            <div key={visit.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row gap-6">
                                <div className="md:w-1/4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                                        <Calendar size={18} />
                                        <span className="font-bold">{visit.date}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-1">Time: <span className="font-medium text-gray-900">{visit.time}</span></div>
                                    <div className="text-sm text-gray-500 mb-2">Type: <span className="capitalize font-medium text-gray-900">{visit.visitType.replace('_', ' ')}</span></div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                                        visit.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        visit.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                        visit.status === 'no_show' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {visit.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="md:w-3/4 space-y-4">
                                    {visit.record ? (
                                        <>
                                            <div>
                                                <div className="flex items-center gap-2 text-gray-900 mb-1 font-bold">
                                                    <FileText size={16} className="text-blue-500" />
                                                    Clinical Notes & Diagnosis
                                                </div>
                                                <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-xl">{visit.record.notes}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 text-gray-900 mb-1 font-bold">
                                                    <Pill size={16} className="text-blue-500" />
                                                    Prescriptions Given
                                                </div>
                                                <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">{visit.record.prescription}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl p-4 text-sm font-medium text-gray-400">
                                            No clinical records provided for this visit.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DoctorLayout>
    );
}
