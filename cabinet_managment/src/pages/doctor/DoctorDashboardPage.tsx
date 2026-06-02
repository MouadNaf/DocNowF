import React, { useEffect, useState } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Calendar, Users, XCircle, DollarSign, Building2, MapPin, Phone, Mail, User, Briefcase, DollarSign as DollarIcon, Clock, FileText, AlertCircle, TrendingUp, ChevronRight, ChevronLeft, Video, MoreHorizontal, CheckCircle2, Activity, FilePlus } from 'lucide-react';
import { useDashboardStats, useAppointments, usePatients } from '@/shared/api/hooks';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
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
    const { patients, loading: patientsLoading } = usePatients();
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

    // Today's date in French
    const todayStr = new Intl.DateTimeFormat('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    }).format(new Date());

    // Calculate Occupancy
    const maxDailySlots = 20; // assumed
    const occupancyRate = stats?.todayAppointments ? Math.min(Math.round((stats.todayAppointments / maxDailySlots) * 100), 100) : 0;

    // Donut Chart Data
    const donutData = [
        { name: 'Consultations', value: stats?.todayAppointments || 10, color: '#3b82f6' },
        { name: 'Suivis', value: Math.round((stats?.todayAppointments || 10) * 0.3), color: '#06b6d4' },
        { name: 'Téléconsultations', value: Math.round((stats?.todayAppointments || 10) * 0.15), color: '#8b5cf6' },
        { name: 'Autres', value: Math.round((stats?.todayAppointments || 10) * 0.05), color: '#9ca3af' },
    ];
    const totalDonut = donutData.reduce((acc, curr) => acc + curr.value, 0);

    // Timeline hours for Agenda
    const timelineHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    return (
        <DoctorLayout>
            <div className="animate-in fade-in slide-in-from-top-4 duration-700 max-w-[1600px] mx-auto pb-10">
                {statsLoading ? (
                    <div className="flex justify-center p-8"><p className="text-slate-500">Loading dashboard...</p></div>
                ) : (
                    <>
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                        {/* Card 1 */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[13px] font-semibold text-slate-500">Rendez-vous aujourd'hui</p>
                                <div className="p-2 bg-blue-50 rounded-xl">
                                    <Calendar size={18} className="text-blue-500" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-2">{stats?.todayAppointments || 0}</h3>
                            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                <TrendingUp size={14} /> +12% depuis hier
                            </p>
                            <div className="absolute -bottom-2 -right-2 opacity-5 text-blue-500 group-hover:scale-110 transition-transform">
                                <Calendar size={80} />
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[13px] font-semibold text-slate-500">Total Patients</p>
                                <div className="p-2 bg-emerald-50 rounded-xl">
                                    <Users size={18} className="text-emerald-500" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-2">{stats?.totalPatients?.toLocaleString() || '0'}</h3>
                            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                <TrendingUp size={14} /> +8% ce mois
                            </p>
                            <div className="absolute -bottom-2 -right-2 opacity-5 text-emerald-500 group-hover:scale-110 transition-transform">
                                <Users size={80} />
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[13px] font-semibold text-slate-500">Rendez-vous à venir</p>
                                <div className="p-2 bg-purple-50 rounded-xl">
                                    <Clock size={18} className="text-purple-500" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-2">{appointments.length}</h3>
                            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                <TrendingUp size={14} /> +5% cette semaine
                            </p>
                            <div className="absolute -bottom-2 -right-2 opacity-5 text-purple-500 group-hover:scale-110 transition-transform">
                                <Clock size={80} />
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[13px] font-semibold text-slate-500">Chiffre d'affaires (mois)</p>
                                <div className="p-2 bg-amber-50 rounded-xl">
                                    <DollarSign size={18} className="text-amber-500" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-2">{stats?.revenueToday?.toLocaleString() || '0'} <span className="text-sm text-slate-400 font-medium">DA</span></h3>
                            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                <TrendingUp size={14} /> +15% ce mois
                            </p>
                            <div className="absolute -bottom-2 -right-2 opacity-5 text-amber-500 group-hover:scale-110 transition-transform">
                                <DollarSign size={80} />
                            </div>
                        </div>

                        {/* Card 5 */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[13px] font-semibold text-slate-500">Taux d'occupation</p>
                                <div className="p-2 bg-cyan-50 rounded-xl">
                                    <Activity size={18} className="text-cyan-500" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-2">{occupancyRate}%</h3>
                            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                <TrendingUp size={14} /> +10% ce mois
                            </p>
                            <div className="absolute -bottom-2 -right-2 opacity-5 text-cyan-500 group-hover:scale-110 transition-transform">
                                <Activity size={80} />
                            </div>
                        </div>
                    </div>

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* LEFT COLUMN (2/3 width) */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Table: Today's Appointments */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
                                <div className="p-5 flex justify-between items-center border-b border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-bold text-slate-800">Rendez-vous d'aujourd'hui</h2>
                                        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">{appointments.length}</span>
                                    </div>
                                </div>
                                
                                <div className="flex-1 overflow-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-slate-50/50 text-slate-500 sticky top-0 backdrop-blur-md">
                                            <tr>
                                                <th className="font-semibold py-3 px-5">Heure</th>
                                                <th className="font-semibold py-3 px-5">Patient</th>
                                                <th className="font-semibold py-3 px-5">Motif</th>
                                                <th className="font-semibold py-3 px-5">Type</th>
                                                <th className="font-semibold py-3 px-5">Statut</th>
                                                <th className="font-semibold py-3 px-5"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {appointments.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-10 text-slate-400">Aucun rendez-vous aujourd'hui</td>
                                                </tr>
                                            ) : (
                                                appointments.slice(0, 5).map((apt, idx) => (
                                                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="py-3 px-5 font-bold text-blue-600">{apt.start_time.substring(0, 5)}</td>
                                                        <td className="py-3 px-5">
                                                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/doctor/consultation/${apt.id}`)}>
                                                                <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                                    {apt.patient?.avatarUrl ? (
                                                                        <img src={apt.patient.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <User size={14} className="text-slate-400" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-800 text-[13px]">{apt.patient?.name || `Patient #${apt.patient_id}`}</p>
                                                                    <p className="text-[11px] text-slate-400">{apt.patient?.age || '28'} ans</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-5 text-slate-600">Consultation générale</td>
                                                        <td className="py-3 px-5">
                                                            {idx === 2 ? (
                                                                <span className="text-purple-600 font-medium text-xs">Téléconsultation</span>
                                                            ) : (
                                                                <span className="text-blue-600 font-medium text-xs">Cabinet</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-5">
                                                            {apt.status === 'confirmed' ? (
                                                                <span className="text-emerald-600 font-medium text-xs">Confirmé</span>
                                                            ) : apt.status === 'pending' ? (
                                                                <span className="text-amber-600 font-medium text-xs">En attente</span>
                                                            ) : (
                                                                <span className="text-slate-600 font-medium text-xs capitalize">{apt.status}</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-5 text-right">
                                                            <button className="text-slate-300 hover:text-slate-600 transition-colors">
                                                                <MoreHorizontal size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-3 border-t border-slate-50 flex justify-center bg-slate-50/30">
                                    <button onClick={() => navigate('/doctor/appointments')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                        Voir tous les rendez-vous <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Bottom 2 Cards inside Left Column */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Activité récente */}
                                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 mb-5">Activité récente</h3>
                                    <div className="space-y-5">
                                        <div className="flex gap-4">
                                            <div className="mt-1 size-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                                <User size={14} className="text-purple-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Nouveau patient inscrit</p>
                                                <p className="text-xs text-slate-500">Sophie Bernard</p>
                                            </div>
                                            <span className="text-xs text-slate-400 ml-auto shrink-0">Il y a 15 min</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="mt-1 size-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                                <Calendar size={14} className="text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Rendez-vous confirmé</p>
                                                <p className="text-xs text-slate-500">Jean Dupont - 10:30</p>
                                            </div>
                                            <span className="text-xs text-slate-400 ml-auto shrink-0">Il y a 1 heure</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="mt-1 size-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                                <DollarIcon size={14} className="text-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Paiement reçu</p>
                                                <p className="text-xs text-slate-500">Consultation - Sarah Martin</p>
                                            </div>
                                            <span className="text-xs text-slate-400 ml-auto shrink-0">Il y a 2 heures</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="mt-1 size-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <FileText size={14} className="text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Document ajouté</p>
                                                <p className="text-xs text-slate-500">Compte rendu - Ali Benali</p>
                                            </div>
                                            <span className="text-xs text-slate-400 ml-auto shrink-0">Il y a 3 heures</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 text-center">
                                        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center w-full gap-1">
                                            Voir toute l'activité <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Répartition des rendez-vous (Donut) */}
                                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">Répartition des rendez-vous</h3>
                                    <div className="flex-1 flex items-center justify-center relative">
                                        <div className="w-full h-48">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={donutData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={70}
                                                        paddingAngle={2}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {donutData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip 
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="text-center">
                                                <p className="text-sm text-slate-400">Total</p>
                                                <p className="text-xl font-bold text-slate-800">{totalDonut}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 space-y-2">
                                        {donutData.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                    <span className="text-slate-600">{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-800">{Math.round((item.value / totalDonut) * 100)}%</span>
                                                    <span className="text-slate-400 text-xs">({item.value})</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (1/3 width) */}
                        <div className="space-y-6">
                            
                            {/* Agenda d'aujourd'hui */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col h-[400px]">
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className="text-lg font-bold text-slate-800">Agenda d'aujourd'hui</h3>
                                    <div className="flex gap-1">
                                        <button className="size-7 rounded-lg border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors">
                                            <ChevronLeft size={16} className="text-slate-400" />
                                        </button>
                                        <button className="size-7 rounded-lg border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors">
                                            <Calendar size={14} className="text-slate-400" />
                                        </button>
                                        <button className="size-7 rounded-lg border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors">
                                            <ChevronRight size={16} className="text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-slate-500 mb-4">{todayStr}</p>
                                
                                <div className="flex-1 overflow-y-auto pr-2 relative agenda-scroll">
                                    {timelineHours.map(hour => {
                                        const aptsHere = appointments.filter(a => a.start_time.startsWith(hour.substring(0, 2)));

                                        return (
                                            <div key={hour} className="flex mb-4 group">
                                                <div className="w-12 text-xs font-semibold text-slate-400 pt-1 flex-shrink-0">
                                                    {hour}
                                                </div>
                                                <div className="flex-1 relative space-y-2">
                                                    {/* Timeline grid line */}
                                                    <div className="absolute top-2.5 left-0 w-full h-px bg-slate-100 -z-10"></div>
                                                    
                                                    {aptsHere.map((apt, index) => {
                                                        return (
                                                            <div key={apt.id || index} className="p-3 rounded-xl border-l-4 bg-blue-50 border-blue-500 cursor-pointer transition-transform hover:-translate-y-0.5" onClick={() => navigate(`/doctor/consultation/${apt.id}`)}>
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-800">{apt.patient?.name || 'Patient'}</p>
                                                                        <p className="text-xs text-blue-600">Consultation générale</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>

                            {/* Patients récents */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className="text-lg font-bold text-slate-800">Patients récents</h3>
                                    <button onClick={() => navigate('/doctor/patients')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                                        Voir tous <ChevronRight size={16} />
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    {patientsLoading ? (
                                        <p className="text-sm text-slate-400 text-center py-4">Chargement...</p>
                                    ) : patients.length === 0 ? (
                                        <div className="space-y-4">
                                            {/* Mock patients if none exist */}
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-slate-200 shrink-0 overflow-hidden"></div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-800">Sophie Bernard</p>
                                                    <p className="text-xs text-slate-500">28 ans • Femme</p>
                                                </div>
                                                <span className="text-xs text-slate-400">Il y a 15 min</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-slate-200 shrink-0 overflow-hidden"></div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-800">Thomas Petit</p>
                                                    <p className="text-xs text-slate-500">35 ans • Homme</p>
                                                </div>
                                                <span className="text-xs text-slate-400">Il y a 1 heure</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-slate-200 shrink-0 overflow-hidden"></div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-800">Emma Dubois</p>
                                                    <p className="text-xs text-slate-500">42 ans • Femme</p>
                                                </div>
                                                <span className="text-xs text-slate-400">Il y a 2 heures</span>
                                            </div>
                                        </div>
                                    ) : (
                                        patients.slice(0, 4).map(patient => (
                                            <div key={patient.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg transition-colors" onClick={() => navigate(`/doctor/patients/${patient.id}/history`)}>
                                                <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                                                    <User size={16} className="text-slate-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                                                    <p className="text-xs text-slate-500">Dernière visite: {patient.lastVisit || 'N/A'}</p>
                                                </div>
                                                <span className="text-xs text-slate-400">Récent</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    </>
                )}
            </div>
        </DoctorLayout>
    );
}

