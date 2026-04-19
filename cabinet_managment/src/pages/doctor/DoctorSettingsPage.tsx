import React from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { useForm } from 'react-hook-form';

export function DoctorSettingsPage() {
    const { register, handleSubmit } = useForm({
        defaultValues: {
            name: 'Dr. Yassine',
            phone: '0555123456',
            speciality: 'General Practitioner',
            address: '123 Health Street, Algiers',
            consultationFee: 2000,
            followUpFee: 1500
        }
    });

    const onSubmit = (data: any) => {
        alert("Settings saved!");
    };

    return (
        <DoctorLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Clinic Settings</h2>
                    <p className="text-gray-500">Manage your profile and consultation fees.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Doctor Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input {...register('name')} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input {...register('phone')} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
                                <input {...register('speciality')} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Address</label>
                                <textarea {...register('address')} rows={3} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Consultation Pricing (DZD)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Time Consultation Fee</label>
                                <div className="relative">
                                    <input {...register('consultationFee')} type="number" className="w-full border border-gray-300 rounded-xl p-3 pl-12 outline-none focus:ring-2 focus:ring-blue-500" />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">DZD</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Fee</label>
                                <div className="relative">
                                    <input {...register('followUpFee')} type="number" className="w-full border border-gray-300 rounded-xl p-3 pl-12 outline-none focus:ring-2 focus:ring-blue-500" />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">DZD</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                            Save Configurations
                        </button>
                    </div>
                </form>
            </div>
        </DoctorLayout>
    );
}
