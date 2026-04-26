import React, { useState, useRef } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Phone, Mail, User, Briefcase, MapPin, Edit3, Save, X, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WILAYAS } from '@/constants/algeria';
import { authService } from '@/services/auth.service';
import { cn } from '@/lib/utils/cn';

const profileSchema = z.object({
  firstName: z.string().min(2, 'PrÃ©nom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  phone_number: z.string().min(10, 'NumÃ©ro de tÃ©lÃ©phone invalide'),
  city: z.string().min(1, 'Wilaya requise'),
  address: z.string().min(5, 'Adresse trop courte'),
  speciality: z.string().min(2, 'SpÃ©cialitÃ© requise'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function DoctorProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [error, setError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPremium = user?.isPremium;

  const { register: regProfile, handleSubmit: handleProfileSubmit, reset, formState: { errors: profErrors, isSubmitting: isProfSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone_number: user?.phone_number || '',
      city: user?.city || '',
      address: user?.address || '',
      speciality: user?.speciality || '',
    }
  });

  React.useEffect(() => {
    const init = async () => {
      try {
        const me = await authService.fetchMe();
        const nameParts = (me.name || '').split(' ');
        updateUser({
          ...user!,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          phone_number: me.phone_number,
          city: me.city,
          address: me.address,
          speciality: me.role_data?.speciality,
          avatarUrl: me.profile_picture
        });
      } catch (e) {
        console.error('Failed to fetch me:', e);
      }
    };
    init();
  }, []);

  React.useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phone_number: user.phone_number || '',
        city: user.city || '',
        address: user.address || '',
        speciality: user.speciality || '',
      });
    }
  }, [user, reset]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      setError('');
      const res = await authService.updateProfile({ profile_picture: file });
      updateUser({
        ...user!,
        avatarUrl: res.user.profile_picture
      });
      setProfileSuccess('Photo de profil mise Ã  jour !');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: any) {
      setError('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      setError('');
      setProfileSuccess('');
      
      const res = await authService.updateProfile({
        name: `${data.firstName} ${data.lastName}`,
        phone_number: data.phone_number,
        city: data.city,
        address: data.address,
        speciality: data.speciality
      });
      
      const nameParts = (res.user.name || '').split(' ');
      updateUser({
        ...user!,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone_number: res.user.phone_number,
        city: res.user.city,
        address: res.user.address,
        speciality: res.user.role_data?.speciality || data.speciality,
      });
      
      setIsEditingProfile(false);
      setProfileSuccess('Informations mises Ã  jour !');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise Ã  jour du profil');
    }
  };

  return (
    <DoctorLayout>
      <div className="max-w-5xl mx-auto space-y-8 py-6 pb-20">
        {/* Profile Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar Area: Avatar & Badges */}
          <div className="w-full md:w-[320px] bg-gray-50/50 p-10 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-100">
            <div className="relative group">
              <div className={cn(
                "size-44 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center overflow-hidden shrink-0 ring-8 ring-gray-100/30 transition-all",
                isUploadingAvatar && "opacity-50"
              )}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.firstName} className="w-full h-full object-cover" />
                ) : (
                  <User size={80} className="text-gray-200" />
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
                    <Loader2 className="animate-spin text-[#1D9E75]" size={40} />
                  </div>
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-2 -right-2 size-12 bg-[#1D9E75] text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                <Camera size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
              />
            </div>

            <div className="mt-8 text-center space-y-4 w-full">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900 ">{user?.firstName} {user?.lastName}</h2>
                <p className="text-[#1D9E75] font-bold text-sm uppercase tracking-wider">{user?.speciality || 'MÃ©decin'}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge color={isPremium ? "blue" : "green"} label={isPremium ? "Membre Premium" : "Professionnel VÃ©rifiÃ©"} />
                {isPremium && (
                  <div className="flex items-center justify-center gap-2 text-[#1D9E75] font-bold text-xs bg-emerald-50 py-2 rounded-xl border border-emerald-100">
                    <CheckCircle2 size={14} /> Compte Professionnel
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area: Forms & Details */}
          <div className="flex-1 p-10 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1D9E75] to-[#3B6D11]"></div>
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold text-gray-900 ">Informations Personnelles</h3>
              {!isEditingProfile && (
                <Button variant="outline" className="rounded-xl gap-2 font-bold h-11 border-gray-200" onClick={() => setIsEditingProfile(true)}>
                  <Edit3 size={16} /> Modifier
                </Button>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <DetailItem icon={<Mail size={18}/>} label="Email" value={user?.email} />
                <DetailItem icon={<Phone size={18}/>} label="TÃ©lÃ©phone" value={user?.phone_number || 'Non renseignÃ©'} />
                <DetailItem icon={<Briefcase size={18}/>} label="SpÃ©cialitÃ©" value={user?.speciality} />
                <DetailItem icon={<MapPin size={18}/>} label="Wilaya" value={user?.city} />
                <div className="sm:col-span-2">
                  <DetailItem icon={<MapPin size={18}/>} label="Adresse complÃ¨te" value={user?.address} />
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Input label="PrÃ©nom" {...regProfile('firstName')} error={profErrors.firstName?.message} className="rounded-2xl h-12" />
                  <Input label="Nom" {...regProfile('lastName')} error={profErrors.lastName?.message} className="rounded-2xl h-12" />
                  <Input label="SpÃ©cialitÃ©" {...regProfile('speciality')} error={profErrors.speciality?.message} icon={<Briefcase size={16}/>} className="rounded-2xl h-12" />
                  <Input label="TÃ©lÃ©phone" {...regProfile('phone_number')} error={profErrors.phone_number?.message} icon={<Phone size={16}/>} className="rounded-2xl h-12" />
                  <Select 
                    label="Wilaya" 
                    options={WILAYAS.map(w => ({ value: w.name, label: w.name }))}
                    {...regProfile('city')} 
                    error={profErrors.city?.message} 
                    className="rounded-2xl h-12"
                  />
                  <Input label="Adresse" {...regProfile('address')} error={profErrors.address?.message} icon={<MapPin size={16}/>} className="rounded-2xl h-12" />
                </div>
                
                {error && <div className="text-sm text-red-500 font-bold bg-red-50 p-4 rounded-2xl border border-red-100">{error}</div>}
                
                <div className="flex gap-4 pt-6 border-t border-gray-50">
                  <Button type="submit" loading={isProfSubmitting} className="rounded-2xl gap-2 px-10 h-13 shadow-md shadow-emerald-100/50">
                    <Save size={18} /> Enregistrer les modifications
                  </Button>
                  <Button type="button" variant="outline" className="rounded-2xl gap-2 px-10 h-13" onClick={() => setIsEditingProfile(false)}>
                    <X size={18} /> Annuler
                  </Button>
                </div>
              </form>
            )}

            {profileSuccess && (
              <div className="mt-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-bold animate-in zoom-in-95 flex items-center gap-3 border border-emerald-100">
                <div className="size-6 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                  <Save size={14} />
                </div>
                {profileSuccess}
              </div>
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="size-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
        <span className="text-[#1D9E75]">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-base font-bold text-gray-700 truncate">{value || '---'}</p>
      </div>
    </div>
  );
}


