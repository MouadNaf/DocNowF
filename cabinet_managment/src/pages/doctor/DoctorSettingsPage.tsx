import React, { useState, useEffect } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Building2, MapPin, DollarSign, Clock, FileText, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WILAYAS } from '@/constants/algeria';
import { doctorService } from '@/services/doctor.service';
import { cn } from '@/lib/utils/cn';
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

export function DoctorSettingsPage() {
  const { user } = useAuthStore();
  const [cabinetId, setCabinetId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const hasCabinet = user?.doctorType === 'private_cabinet';

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<CabinetFormValues>({
    resolver: zodResolver(cabinetSchema),
  });

  const watchLatitude = watch('latitude');
  const watchLongitude = watch('longitude');

  useEffect(() => {
    const fetchCabinet = async () => {
      if (!hasCabinet) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await doctorService.getCabinet();
        if (res.cabinet) {
          setCabinetId(res.cabinet.id);
          reset({
            name: res.cabinet.name,
            city: res.cabinet.city,
            address: res.cabinet.address,
            latitude: res.cabinet.latitude ? Number(res.cabinet.latitude) : 36.7538,
            longitude: res.cabinet.longitude ? Number(res.cabinet.longitude) : 3.0588,
            bio: res.cabinet.bio || '',
            consultation_price: String(res.cabinet.consultation_price),
            follow_up_price: String(res.cabinet.follow_up_price || ''),
            slot_duration: String(res.cabinet.slot_duration),
          });
        }
      } catch (err) {
        console.error('Failed to fetch cabinet:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCabinet();
  }, [hasCabinet, reset]);

  const onSubmit = async (data: CabinetFormValues) => {
    if (!cabinetId) return;
    try {
      setSuccess('');
      setError('');
      await doctorService.updateCabinet(cabinetId, data);
      setSuccess('ParamÃ¨tres du cabinet mis Ã  jour avec succÃ¨s !');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise Ã  jour');
    }
  };

  if (!hasCabinet && !isLoading) {
    return (
      <DoctorLayout>
        <div className="max-w-4xl mx-auto py-12 text-center space-y-6">
          <div className="size-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
            <Building2 size={40} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Aucun Cabinet PrivÃ©</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Vous n'avez pas encore configurÃ© de cabinet privÃ©. Les paramÃ¨tres de cabinet ne sont disponibles que pour les membres Premium ayant une pratique active.
          </p>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="max-w-5xl mx-auto space-y-8 py-6 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 ">ParamÃ¨tres du Cabinet</h1>
            <p className="text-gray-500 font-medium">GÃ©rez la visibilitÃ© et les tarifs de votre pratique</p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
            <CheckCircle2 className="text-emerald-500" size={18} />
            <span className="text-emerald-700 font-bold text-sm">Cabinet Actif & VÃ©rifiÃ©</span>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#1D9E75]" size={40} />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* General Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 space-y-8">
              <div className="flex items-center gap-4 pb-6 border-b border-gray-50">
                <div className="size-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#1D9E75]">
                  <Building2 size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Informations GÃ©nÃ©rales</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="Nom du cabinet" icon={<Building2 size={18} />} error={errors.name?.message} {...register('name')} />
                <Select label="Wilaya" options={WILAYAS.map(w => ({ value: w.name, label: w.name }))} error={errors.city?.message} {...register('city')} />
                <div className="md:col-span-2 col-span-1">
                  <Input label="Adresse exacte" icon={<MapPin size={18} />} error={errors.address?.message} {...register('address')} />
                </div>
                <div className="md:col-span-2 col-span-1 space-y-2 mt-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">Position sur la carte (OpenStreetMap)</label>
                  <LocationPicker 
                    latitude={watchLatitude} 
                    longitude={watchLongitude} 
                    onChange={(lat, lng) => {
                      setValue('latitude', lat);
                      setValue('longitude', lng);
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Consultation & Slots */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-10 space-y-8">
                <div className="flex items-center gap-4 pb-6 border-b border-gray-50">
                  <div className="size-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <DollarSign size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Tarification & CrÃ©neaux</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Input label="Consultation Standard (DZD)" type="number" icon={<DollarSign size={18} />} error={errors.consultation_price?.message} {...register('consultation_price')} />
                  <Input label="Prix de Suivi (DZD)" type="number" icon={<DollarSign size={18} />} error={errors.follow_up_price?.message} {...register('follow_up_price')} />
                  <div className="sm:col-span-2">
                    <Input label="DurÃ©e par Patient (Minutes)" type="number" icon={<Clock size={18} />} error={errors.slot_duration?.message} {...register('slot_duration')} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-gray-50">
                  <div className="size-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                    <FileText size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Biographie</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">PrÃ©sentation</label>
                  <textarea 
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/10 outline-none transition-all min-h-[220px] resize-none font-medium text-gray-700"
                    placeholder="DÃ©crivez votre pratique..."
                    {...register('bio')}
                  />
                  {errors.bio && <p className="text-xs text-red-500 font-bold ml-1">{errors.bio.message}</p>}
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {success && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-3 font-bold animate-in zoom-in-95">
                <CheckCircle2 size={20} />
                {success}
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3 font-bold animate-in zoom-in-95">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button type="submit" loading={isSubmitting} size="lg" className="rounded-xl px-16 h-12 text-base font-semibold shadow-md shadow-emerald-100/50">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={24} />} Enregistrer les paramÃ¨tres
              </Button>
            </div>
          </form>
        )}
      </div>
    </DoctorLayout>
  );
}


