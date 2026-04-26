import React, { useState } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Building2, MapPin, Briefcase, DollarSign, Clock, FileText, AlertCircle, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth.store';
import { useAppStore } from '@/store/app.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WILAYAS } from '@/constants/algeria';
import { doctorService } from '@/services/doctor.service';

const cabinetSchema = z.object({
  name: z.string().min(3, 'Cabinet name must be at least 3 characters'),
  city: z.string().min(1, 'Please select a city'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  consultation_price: z.string().min(1, 'Price is required'),
  follow_up_price: z.string().min(1, 'Follow-up price is required'),
  slot_duration: z.string().min(1, 'Slot duration is required'),
});

type CabinetFormValues = z.infer<typeof cabinetSchema>;

export function DoctorCabinetPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { setPlansModalOpen } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const hasCabinet = user?.doctorType === 'private_cabinet';
  const isPremium = user?.isPremium;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CabinetFormValues>({
    resolver: zodResolver(cabinetSchema),
    defaultValues: {
      slot_duration: '30',
    }
  });

  const onSubmit = async (data: CabinetFormValues) => {
    try {
      setError('');
      await doctorService.createCabinet(data);
      updateUser({ ...user!, doctorType: 'private_cabinet' });
      navigate(ROUTES.DOCTOR_DASHBOARD);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la crÃ©ation du cabinet');
    }
  };

  return (
    <DoctorLayout>
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-[#1D9E75]/10 p-3 rounded-2xl">
            <Building2 className="text-[#1D9E75]" size={32} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 ">Mon Cabinet PrivÃ©</h1>
            <p className="text-gray-500 font-medium">GÃ©rez votre Ã©tablissement de santÃ© numÃ©rique</p>
          </div>
        </div>

        {hasCabinet ? (
          <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-6">
              <div className="size-20 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                <Building2 className="text-[#1D9E75]" size={40} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Cabinet Actif</h2>
                <p className="text-gray-600 font-medium">Votre cabinet est entiÃ¨rement configurÃ© et accepte des rendez-vous.</p>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button size="lg" className="rounded-2xl px-10 h-14 font-bold shadow-lg shadow-emerald-100" onClick={() => navigate(ROUTES.DOCTOR_DASHBOARD)}>
                Aller au Dashboard
              </Button>
              <Button variant="outline" size="lg" className="rounded-2xl px-10 h-14 font-bold" onClick={() => navigate(ROUTES.DOCTOR_SETTINGS)}>
                ParamÃ¨tres du cabinet
              </Button>
            </div>
          </div>
        ) : !isPremium ? (
          <div className="bg-gradient-to-br from-[#1D9E75] to-[#3B6D11] rounded-2xl p-12 text-white text-center space-y-10 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="size-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto border border-white/30">
              <Crown size={48} className="text-white fill-white" />
            </div>
            <div className="max-w-xl mx-auto space-y-4 relative z-10">
              <h2 className="text-xl font-semibold ">AccÃ¨s Premium Requis</h2>
              <p className="text-emerald-50 font-medium text-xl leading-relaxed">
                La gestion d'un cabinet privÃ© est rÃ©servÃ©e Ã  nos membres Premium. Souscrivez dÃ¨s maintenant pour dÃ©bloquer la prise de rendez-vous en ligne et la gestion de vos secrÃ©taires.
              </p>
            </div>
            <Button 
              size="lg" 
              className="rounded-2xl px-16 bg-white text-[#1D9E75] hover:bg-emerald-50 font-bold h-16 text-xl border-none relative z-10 shadow-lg shadow-black/20" 
              onClick={() => setPlansModalOpen(true)}
            >
              Voir les plans & Tarifs
            </Button>
          </div>
        ) : !showForm ? (
          <div className="bg-white rounded-2xl p-16 border-2 border-dashed border-gray-200 text-center space-y-10">
            <div className="size-28 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Building2 size={56} className="text-[#1D9E75]" />
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 ">PrÃªt Ã  commencer ?</h2>
              <p className="text-gray-500 text-lg font-medium leading-relaxed">
                Configurez votre cabinet en quelques minutes et commencez Ã  digitaliser votre pratique mÃ©dicale dÃ¨s aujourd'hui.
              </p>
            </div>
            <Button size="lg" className="rounded-2xl px-16 h-12 text-base font-semibold shadow-lg shadow-emerald-100" onClick={() => setShowForm(true)}>
              CrÃ©er mon cabinet
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="size-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                  <Building2 className="text-[#1D9E75]" size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 ">DÃ©tails du cabinet</h2>
                  <p className="text-gray-500 font-medium">Informations pour votre cabinet privÃ©</p>
                </div>
              </div>
              <Button variant="outline" className="rounded-xl h-10 px-4 font-bold text-gray-500 border-gray-100" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-medium">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <Input label="Nom du cabinet" icon={<Building2 size={18} />} error={errors.name?.message} {...register('name')} />
                  <Select label="Wilaya" options={WILAYAS.map(w => ({ value: w.name, label: w.name }))} error={errors.city?.message} {...register('city')} />
                  <Input label="Adresse exacte" icon={<MapPin size={18} />} error={errors.address?.message} {...register('address')} />
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <Input label="Prix Consultation" type="number" icon={<DollarSign size={18} />} error={errors.consultation_price?.message} {...register('consultation_price')} />
                    <Input label="Prix Suivi" type="number" icon={<DollarSign size={18} />} error={errors.follow_up_price?.message} {...register('follow_up_price')} />
                  </div>
                  <Input label="DurÃ©e CrÃ©neau (Min)" type="number" icon={<Clock size={18} />} error={errors.slot_duration?.message} {...register('slot_duration')} />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase ml-1">Bio / Description</label>
                    <textarea 
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/10 outline-none min-h-[140px] resize-none font-medium"
                      {...register('bio')}
                    />
                    {errors.bio && <p className="text-xs text-red-500 font-bold ml-1">{errors.bio.message}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-gray-50">
                <Button type="submit" fullWidth className="rounded-xl h-12 text-base font-semibold shadow-md shadow-emerald-100" loading={isSubmitting}>
                  Finaliser la crÃ©ation
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}


