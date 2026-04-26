import React, { useEffect, useMemo, useState } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { doctorService, type Availability } from '@/services/doctor.service';

export function DoctorSchedulePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [availabilityByDay, setAvailabilityByDay] = useState<Record<number, { id?: number; startTime: string; endTime: string }>>({});

    const days = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], []);
    const dayNameToIndex: Record<Availability['day_of_week'], number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
    };
    const dayIndexToName: Record<number, Availability['day_of_week']> = {
        0: 'sunday',
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday'
    };

    useEffect(() => {
        const fetchAvailabilities = async () => {
            try {
                setLoading(true);
                const res = await doctorService.getAvailabilities();
                const list = res?.availabilities || [];
                const mapped: Record<number, { id?: number; startTime: string; endTime: string }> = {};
                const selected: number[] = [];

                list.forEach((item: Availability) => {
                    const idx = dayNameToIndex[item.day_of_week];
                    mapped[idx] = {
                        id: item.id,
                        startTime: item.start_time?.slice(0, 5) || '09:00',
                        endTime: item.end_time?.slice(0, 5) || '16:00'
                    };
                    selected.push(idx);
                });

                setAvailabilityByDay(mapped);
                setSelectedDays(selected.sort((a, b) => a - b));
            } catch (err: any) {
                setError(err?.response?.data?.message || 'Failed to load availabilities.');
            } finally {
                setLoading(false);
            }
        };

        fetchAvailabilities();
    }, []);

    const toggleDay = (idx: number) => {
        setSuccess('');
        setError('');
        setSelectedDays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx].sort((a, b) => a - b));
        setAvailabilityByDay(prev => ({
            ...prev,
            [idx]: prev[idx] || { startTime: '09:00', endTime: '16:00' }
        }));
    };

    const updateDayTime = (dayIdx: number, field: 'startTime' | 'endTime', value: string) => {
        setAvailabilityByDay(prev => ({
            ...prev,
            [dayIdx]: {
                ...(prev[dayIdx] || { startTime: '09:00', endTime: '16:00' }),
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const selectedSet = new Set(selectedDays);
            const existingDays = Object.keys(availabilityByDay).map(Number);

            const toDelete = existingDays.filter((d) => !selectedSet.has(d) && availabilityByDay[d]?.id);
            for (const dayIdx of toDelete) {
                await doctorService.deleteAvailability(availabilityByDay[dayIdx].id as number);
            }

            for (const dayIdx of selectedDays) {
                const row = availabilityByDay[dayIdx] || { startTime: '09:00', endTime: '16:00' };
                if (!row.startTime || !row.endTime || row.startTime >= row.endTime) {
                    throw new Error(`Invalid time range for ${days[dayIdx]}.`);
                }

                if (row.id) {
                    await doctorService.updateAvailability(row.id, {
                        day_of_week: dayIndexToName[dayIdx],
                        start_time: row.startTime,
                        end_time: row.endTime
                    });
                } else {
                    const created = await doctorService.createAvailability({
                        day_of_week: dayIndexToName[dayIdx],
                        start_time: row.startTime,
                        end_time: row.endTime
                    });
                    const createdRow = created?.availability || created?.data;
                    if (createdRow?.id) {
                        setAvailabilityByDay(prev => ({
                            ...prev,
                            [dayIdx]: { ...prev[dayIdx], id: createdRow.id }
                        }));
                    }
                }
            }

            setSuccess('Planning saved successfully.');
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to save planning.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DoctorLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Settings</h2>
                    <p className="text-gray-500">Configure your working hours and appointment durations.</p>
                </div>
                {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

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
                            const sched = availabilityByDay[dayIdx] || { startTime: '09:00', endTime: '16:00' };
                            return (
                                <div key={dayIdx} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center gap-6">
                                    <div className="w-32 font-bold text-gray-900">{days[dayIdx]}</div>
                                    
                                    <div className="flex items-center gap-4 flex-1">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Start Time</label>
                                            <input
                                                type="time"
                                                value={sched.startTime}
                                                onChange={(e) => updateDayTime(dayIdx, 'startTime', e.target.value)}
                                                className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div className="mt-6 text-gray-400">-</div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">End Time</label>
                                            <input
                                                type="time"
                                                value={sched.endTime}
                                                onChange={(e) => updateDayTime(dayIdx, 'endTime', e.target.value)}
                                                className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </DoctorLayout>
    );
}