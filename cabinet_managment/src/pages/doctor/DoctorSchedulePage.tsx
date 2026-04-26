import { useEffect, useMemo, useState } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { doctorService, type Availability, type Unavailability } from '@/services/doctor.service';

export function DoctorSchedulePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [availabilityByDay, setAvailabilityByDay] = useState<Record<number, { id?: number; startTime: string; endTime: string }>>({});
    const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
    const [selectedUnavailability, setSelectedUnavailability] = useState<Unavailability | null>(null);
    const [unavailabilityForm, setUnavailabilityForm] = useState({
        start_date: '',
        end_date: '',
        is_closed: true,
        start_time: '09:00',
        end_time: '12:00',
        reason: ''
    });

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
                const [availabilityRes, unavailabilityRes] = await Promise.all([
                    doctorService.getAvailabilities(),
                    doctorService.getUnavailabilities()
                ]);
                const list = availabilityRes?.availabilities || [];
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
                const unavailabilityList = (unavailabilityRes?.unavailabilities || []).map((u: any) => ({
                    ...u,
                    is_closed: !u.start_time || !u.end_time
                }));
                setUnavailabilities(unavailabilityList);
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

    const toDate = (value: string) => new Date(`${value}T00:00:00`);
    const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString();
    const timeToMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
    const getCurrentWeekDates = () => {
        const today = new Date();
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            return d;
        });
    };
    const isDateInUnavailability = (date: Date, item: Unavailability) => {
        const current = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const start = toDate(item.start_date).getTime();
        const end = toDate(item.end_date).getTime();
        return current >= start && current <= end;
    };
    const getUnavailabilityForDate = (date: Date) => {
        return unavailabilities.filter((u) => isDateInUnavailability(date, u));
    };
    const getPartialOverlayStyle = (startTime: string, endTime: string) => {
        const startPct = clamp((timeToMinutes(startTime) / (24 * 60)) * 100, 0, 100);
        const endPct = clamp((timeToMinutes(endTime) / (24 * 60)) * 100, 0, 100);
        return { left: `${startPct}%`, width: `${Math.max(endPct - startPct, 2)}%` };
    };
    const weekDates = getCurrentWeekDates();

    const handleCreateUnavailability = async () => {
        try {
            setError('');
            setSuccess('');

            if (!unavailabilityForm.start_date || !unavailabilityForm.end_date) {
                throw new Error('Start date and end date are required.');
            }

            const payload = {
                start_date: unavailabilityForm.start_date,
                end_date: unavailabilityForm.end_date,
                reason: unavailabilityForm.reason || undefined,
                ...(unavailabilityForm.is_closed
                    ? {}
                    : {
                        start_time: unavailabilityForm.start_time,
                        end_time: unavailabilityForm.end_time
                    })
            };

            const res = await doctorService.createUnavailability(payload);
            const created = res?.data || res?.unavailability;
            if (created) {
                setUnavailabilities((prev) => [
                    ...prev,
                    {
                        ...created,
                        is_closed: !created.start_time || !created.end_time
                    }
                ]);
            }
            setSuccess('Unavailability added.');
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to add unavailability.');
        }
    };

    const handleDeleteUnavailability = async (id: number) => {
        try {
            setError('');
            setSuccess('');
            await doctorService.deleteUnavailability(id);
            setUnavailabilities((prev) => prev.filter((u) => u.id !== id));
            setSelectedUnavailability(null);
            setSuccess('Unavailability deleted.');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to delete unavailability.');
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

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Doctor Unavailability</h3>
                        <p className="text-sm text-gray-500">Add vacations/closures directly in planning.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Start date</label>
                            <input
                                type="date"
                                value={unavailabilityForm.start_date}
                                onChange={(e) => setUnavailabilityForm((p) => ({ ...p, start_date: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">End date</label>
                            <input
                                type="date"
                                value={unavailabilityForm.end_date}
                                onChange={(e) => setUnavailabilityForm((p) => ({ ...p, end_date: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            />
                        </div>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                            type="checkbox"
                            checked={unavailabilityForm.is_closed}
                            onChange={(e) => setUnavailabilityForm((p) => ({ ...p, is_closed: e.target.checked }))}
                        />
                        Full-day closure
                    </label>

                    {!unavailabilityForm.is_closed && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Start time</label>
                                <input
                                    type="time"
                                    value={unavailabilityForm.start_time}
                                    onChange={(e) => setUnavailabilityForm((p) => ({ ...p, start_time: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">End time</label>
                                <input
                                    type="time"
                                    value={unavailabilityForm.end_time}
                                    onChange={(e) => setUnavailabilityForm((p) => ({ ...p, end_time: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Reason</label>
                        <input
                            type="text"
                            placeholder="Vacation, sick leave, conference..."
                            value={unavailabilityForm.reason}
                            onChange={(e) => setUnavailabilityForm((p) => ({ ...p, reason: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleCreateUnavailability}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg"
                        >
                            Add Unavailability
                        </button>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-800">Planning Preview (Next 7 days)</h4>
                        {weekDates.map((date) => {
                            const dayUnavailabilities = getUnavailabilityForDate(date);
                            const fullDay = dayUnavailabilities.find((u) => u.is_closed);
                            const partials = dayUnavailabilities.filter((u) => !u.is_closed && u.start_time && u.end_time);
                            const dayName = days[date.getDay()];
                            const hasAvailability = selectedDays.includes(date.getDay());

                            return (
                                <div key={date.toISOString()} className="border border-gray-100 rounded-xl p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-semibold text-gray-800">{dayName} - {date.toLocaleDateString()}</p>
                                        {!hasAvailability && <span className="text-xs text-gray-400">No recurring availability</span>}
                                    </div>
                                    <div className="relative h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                        {hasAvailability && <div className="absolute inset-0 bg-emerald-100/70" />}

                                        {fullDay && (
                                            <button
                                                title={`${fullDay.reason || 'Unavailable'} | ${formatDate(fullDay.start_date)} - ${formatDate(fullDay.end_date)} | private cabinet`}
                                                onClick={() => setSelectedUnavailability(fullDay)}
                                                className="absolute inset-0 bg-red-400/85 text-white text-xs font-semibold"
                                            >
                                                Unavailable
                                            </button>
                                        )}

                                        {!fullDay && partials.map((u) => (
                                            <button
                                                key={u.id}
                                                title={`${u.reason || 'Partial block'} | ${formatDate(u.start_date)} - ${formatDate(u.end_date)} | ${u.start_time?.slice(0, 5)}-${u.end_time?.slice(0, 5)} | private cabinet`}
                                                onClick={() => setSelectedUnavailability(u)}
                                                className="absolute top-0 bottom-0 bg-orange-400/90 text-[10px] text-white px-1 text-left"
                                                style={getPartialOverlayStyle(u.start_time!, u.end_time!)}
                                            >
                                                Blocked
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-800">Current Unavailability Periods</h4>
                        {unavailabilities.length === 0 ? (
                            <p className="text-sm text-gray-500">No unavailability added.</p>
                        ) : (
                            unavailabilities.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => setSelectedUnavailability(u)}
                                    title={`${u.reason || 'Unavailable'} | ${formatDate(u.start_date)} - ${formatDate(u.end_date)} | private cabinet`}
                                    className={`w-full text-left p-3 rounded-xl border ${u.is_closed ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}
                                >
                                    <p className="text-sm font-semibold text-gray-800">{u.reason || 'Unavailable'}</p>
                                    <p className="text-xs text-gray-600">
                                        {formatDate(u.start_date)} - {formatDate(u.end_date)}
                                        {!u.is_closed && ` | ${u.start_time?.slice(0, 5)} - ${u.end_time?.slice(0, 5)}`}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {selectedUnavailability && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedUnavailability(null)} />
                    <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Unavailability Details</h3>
                        <div className="text-sm text-gray-700 space-y-1">
                            <p><span className="font-semibold">Reason:</span> {selectedUnavailability.reason || 'N/A'}</p>
                            <p><span className="font-semibold">Range:</span> {formatDate(selectedUnavailability.start_date)} - {formatDate(selectedUnavailability.end_date)}</p>
                            <p><span className="font-semibold">Type:</span> {selectedUnavailability.is_closed ? 'Full day closure' : 'Partial block'}</p>
                            {!selectedUnavailability.is_closed && (
                                <p><span className="font-semibold">Time:</span> {selectedUnavailability.start_time?.slice(0, 5)} - {selectedUnavailability.end_time?.slice(0, 5)}</p>
                            )}
                            <p><span className="font-semibold">Context:</span> private cabinet</p>
                        </div>
                        <div className="flex justify-between gap-3 pt-2">
                            <button
                                onClick={() => handleDeleteUnavailability(selectedUnavailability.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setSelectedUnavailability(null)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DoctorLayout>
    );
}