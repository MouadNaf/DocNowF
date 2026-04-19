import React, { useState } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { useSchedules } from '@/shared/api/hooks';

export function DoctorSchedulePage() {
    const { schedules, loading } = useSchedules();
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const toggleDay = (idx: number) => {
        setSelectedDays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx].sort());
    };

    return (
        <DoctorLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Settings</h2>
                    <p className="text-gray-500">Configure your working hours and appointment durations.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Working Days</h3>
                    <div className="flex flex-wrap gap-3">
                        {days.map((day, idx) => (
                            <button
                                key={day}
                                onClick={() => toggleDay(idx)}
                                className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                                    selectedDays.includes(idx) 
                                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="p-4">Loading schedules...</div>
                ) : (
                    <div className="space-y-4">
                        {selectedDays.map(dayIdx => {
                            const sched = schedules.find(s => s.dayOfWeek === dayIdx) || { startTime: '09:00', endTime: '16:00', slotDuration: 30, bufferTime: 0 };
                            return (
                                <div key={dayIdx} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center gap-6">
                                    <div className="w-32 font-bold text-gray-900">{days[dayIdx]}</div>
                                    
                                    <div className="flex items-center gap-4 flex-1">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Start Time</label>
                                            <input type="time" defaultValue={sched.startTime} className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div className="mt-6 text-gray-400">-</div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">End Time</label>
                                            <input type="time" defaultValue={sched.endTime} className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Slot (min)</label>
                                            <input type="number" defaultValue={sched.slotDuration} className="w-20 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Buffer (min)</label>
                                            <input type="number" defaultValue={sched.bufferTime} className="w-20 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </DoctorLayout>
    );
}