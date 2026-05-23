import React, { useEffect, useState } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Calendar, Users, XCircle, DollarSign, Building2, MapPin, Phone, Mail, User, Briefcase, DollarSign as DollarIcon, Clock, FileText, AlertCircle } from 'lucide-react';
import { useDashboardStats, useAppointments } from '@/shared/api/hooks';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WILAYAS } from '@/constants/algeria';
import { doctorService } from '@/services/doctor.service';
import { LocationPicker } from '@/components/ui/LocationPicker';

const cabinetSchema = z.object({
  name: z.string().min(3, 'Cabinet name must be at least 3 characters'),
  city: z.string().min(1, 'Please select a city'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  consultation_price: z.string().min(1, 'Price is required'),
  follow_up_price: z.string().min(1, 'Follow-up price is required'),
  slot_duration: z.string().min(1, 'Slot duration is required'),
});

type CabinetFormValues = z.infer<typeof cabinetSchema>;

export function DoctorDashboardPage() {
    const { user, updateUser } = useAuthStore();
    const { data: stats, loading: statsLoading } = useDashboardStats();
    const { appointments, loading: aptsLoading } = useAppointments({ date: new Date().toISOString().split('T')[0] }); 
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [cabinetError, setCabinetError] = useState('');
    const [checkingCabinet, setCheckingCabinet] = useState(true);

    const hasCabinet = user?.doctorType === 'private_cabinet';

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<CabinetFormValues>({
        resolver: zodResolver(cabinetSchema),
        defaultValues: {
            slot_duration: '30',
            latitude: 36.7538,
            longitude: 3.0588,
        }
    });

    const watchLatitude = watch('latitude');
    const watchLongitude = watch('longitude');

    useEffect(() => {
        const checkCabinet = async () => {
            try {
                const res = await doctorService.getCabinet();
                const hasPrivateCabinet = Boolean(res?.cabinet || res?.data || res?.id);
                if (hasPrivateCabinet) {
                    updateUser({ doctorType: 'private_cabinet' });
                }
            } catch (err: any) {
                if (err?.response?.status !== 404) {
                    console.error('Failed to fetch private cabinet:', err);
                }
            } finally {
                setCheckingCabinet(false);
            }
        };

        checkCabinet();
    }, [updateUser]);

    const onCreateCabinet = async (data: CabinetFormValues) => {
        try {
            setCabinetError('');
            await doctorService.createCabinet(data);
            updateUser({ doctorType: 'private_cabinet' });
            setShowForm(false);
            navigate('/doctor/cabinet');
        } catch (err: any) {
            setCabinetError(err?.response?.data?.message || 'Failed to create private cabinet.');
        }
    };

    if (checkingCabinet) {
        return (
            <DoctorLayout>
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                    <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm text-center">
                        <p className="text-gray-600 font-medium">Loading your private cabinet...</p>
                    </div>
                </div>
            </DoctorLayout>
        );
    }

    if (!hasCabinet) {
        return (
            <DoctorLayout>
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                    {/* Profile Header */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1D9E75] to-[#3B6D11]"></div>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="size-32 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center overflow-hidden">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                    <h1 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h1>
                                    <Badge color="green" label="Verified Professional" />
                                </div>
                                <p className="text-lg text-gray-600 flex items-center justify-center md:justify-start gap-2 mb-4">
                                    <Briefcase size={20} className="text-[#1D9E75]" />
                                    Specialist Doctor
                                </p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Mail size={18} />
                                        <span>{user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Phone size={18} />
                                        <span>+213 550 123 456</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!showForm ? (
                        <div className="bg-[#f0f9f6] rounded-2xl p-10 border border-[#d1e9e0] text-center space-y-6">
                            <div className="size-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                <Building2 size={40} className="text-[#1D9E75]" />
                            </div>
                            <div className="max-w-md mx-auto space-y-2">
                                <h2 className="text-xl font-bold text-gray-900">Setup Your Private Cabinet</h2>
                                <p className="text-gray-600">
                                    You haven't set up your private practice yet. Create your cabinet to start managing appointments and patients.
                                </p>
                            </div>
                            <Button size="lg" className="rounded-2xl px-12" onClick={() => setShowForm(true)}>
                                Create My Cabinet
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-8 animate-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-4">
                                <div className="size-12 bg-[#f0f9f6] rounded-xl flex items-center justify-center">
                                    <Building2 className="text-[#1D9E75]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Cabinet Details</h2>
                                    <p className="text-sm text-gray-500">Enter the information for your private practice</p>
                                </div>
                            </div>

                            {cabinetError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {cabinetError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onCreateCabinet)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        <Input 
                                            label="Cabinet Name" 
                                            placeholder="e.g. Cabinet de Cardiologie Dr. Amrani"
                                            icon={<Building2 size={18} />}
                                            error={errors.name?.message}
                                            {...register('name')}
                                        />
                                        
                                        <Select 
                                            label="Wilaya"
                                            options={WILAYAS.map(w => ({ value: w.name, label: `${w.code} - ${w.name}` }))}
                                            placeholder="Select city"
                                            error={errors.city?.message}
                                            {...register('city')}
                                        />

                                        <Input 
                                            label="Address" 
                                            placeholder="Full street address"
                                            icon={<MapPin size={18} />}
                                            error={errors.address?.message}
                                            {...register('address')}
                                        />
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input 
                                                label="Consultation Price (DZD)" 
                                                type="number"
                                                placeholder="2500"
                                                icon={<DollarIcon size={18} />}
                                                error={errors.consultation_price?.message}
                                                {...register('consultation_price')}
                                            />
                                            <Input 
                                                label="Follow-up Price (DZD)" 
                                                type="number"
                                                placeholder="1500"
                                                icon={<DollarIcon size={18} />}
                                                error={errors.follow_up_price?.message}
                                                {...register('follow_up_price')}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <Input 
                                                label="Slot Duration (Min)" 
                                                type="number"
                                                placeholder="30"
                                                icon={<Clock size={18} />}
                                                error={errors.slot_duration?.message}
                                                {...register('slot_duration')}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Bio / Description</label>
                                            <div className="relative">
                                                <FileText size={18} className="absolute top-3 left-3 text-gray-400" />
                                                <textarea 
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 outline-none transition-all min-h-[120px] resize-none"
                                                    placeholder="Tell patients about your cabinet, experience, and services..."
                                                    {...register('bio')}
                                                />
                                            </div>
                                            {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Geographic Location Selection */}
                                <div className="space-y-4 pt-6 border-t border-gray-50">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-700 uppercase">Localisation sur la carte</h3>
                                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">Choisissez l'emplacement géographique exact de votre cabinet sur la carte.</p>
                                    </div>
                                    <LocationPicker 
                                        latitude={watchLatitude} 
                                        longitude={watchLongitude} 
                                        onChange={(lat, lng) => {
                                            setValue('latitude', lat);
                                            setValue('longitude', lng);
                                        }} 
                                    />
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-gray-50">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="flex-1 rounded-2xl"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="flex-[2] rounded-2xl"
                                        loading={isSubmitting}
                                    >
                                        Create Cabinet & Reveal Dashboard
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </DoctorLayout>
        );
    }

    return (
        <DoctorLayout>
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                {statsLoading ? (
                    <div className="flex justify-center p-8"><p>Loading stats...</p></div>
                ) : (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <StatCard 
                            title="Today's Appointments" 
                            value={stats?.todayAppointments.toString() || '0'} 
                            icon={<Calendar size={24} />} 
                            iconBgClass="bg-emerald-50"
                            iconColorClass="text-[#1D9E75]"
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
                        <StatCard 
                            title="Wallet Balance" 
                            value={`${stats?.wallet_balance || 0} DZD`} 
                            icon={<DollarSign size={24} />} 
                            iconBgClass={stats?.is_exhausted ? "bg-red-50" : (stats?.low_balance ? "bg-orange-50" : "bg-emerald-50")}
                            iconColorClass={stats?.is_exhausted ? "text-red-500" : (stats?.low_balance ? "text-orange-500" : "text-[#1D9E75]")}
                            subtext={stats?.is_exhausted ? "Exhausted!" : (stats?.low_balance ? "Low Balance" : "Active")}
                            subtextColorClass={stats?.is_exhausted ? "text-red-500" : (stats?.low_balance ? "text-orange-500" : "text-emerald-500")}
                        />
                    </div>

                    {stats?.low_balance && (
                        <div className={`mb-8 p-4 rounded-2xl border flex items-center justify-between ${stats?.is_exhausted ? 'bg-red-50 border-red-100 text-red-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
                            <div className="flex items-center gap-3">
                                <AlertCircle size={20} />
                                <div>
                                    <p className="font-bold">{stats?.is_exhausted ? 'Wallet Exhausted' : 'Low Wallet Balance'}</p>
                                    <p className="text-sm">{stats?.is_exhausted ? 'You cannot receive new bookings until you recharge.' : 'Recharge soon to avoid booking interruptions.'}</p>
                                </div>
                            </div>
                            <Button size="sm" variant={stats?.is_exhausted ? 'primary' : 'outline'} className="rounded-xl px-6" onClick={() => navigate('/doctor/accounting')}>
                                Recharge Now
                            </Button>
                        </div>
                    )}
                    </>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Today's Appointments</h3>
                        <span className="bg-emerald-50 text-[#1D9E75] text-sm font-semibold px-4 py-1.5 rounded-full border border-emerald-100">
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
                                      case 'confirmed': return 'bg-emerald-100 text-[#15805d]';
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
                                                <p className="text-lg font-bold text-gray-900">{apt.start_time}</p>
                                            </div>
                                            <div className="h-10 w-px bg-gray-200"></div>
                                            <div>
                                                <p className="text-base font-bold text-gray-900">{apt.patient?.name || `Patient #${apt.patient_id}`}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${getStatusColor(apt.status)} capitalize`}>
                                                {apt.status.replace('_', ' ')}
                                            </span>
                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${getPaymentColor(apt.payment_status)} capitalize`}>
                                                {apt.payment_status}
                                            </span>
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

