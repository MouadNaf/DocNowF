import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Mail, Lock, Phone,
  CheckCircle2, Loader2, AlertCircle, Trash2, Eye, EyeOff, Copy
} from 'lucide-react';
import { doctorService } from '@/services/doctor.service';
import type { Secretary } from '@/services/doctor.service';
import { cn } from '@/lib/utils/cn';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';

// â”€â”€â”€ Schema â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const secretarySchema = z.object({
  firstName: z.string().min(2, 'Requis'),
  lastName:  z.string().min(2, 'Requis'),
  email:     z.string().email('Email invalide'),
  gender:    z.enum(['male', 'female'], { required_error: 'Requis' }),
  password:  z.string().min(8, 'Minimum 8 caractÃ¨res'),
  password_confirmation: z.string().min(8, 'Minimum 8 caractÃ¨res'),
  phone_number: z.string().min(10, 'NumÃ©ro invalide'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});
type SecretaryFormValues = z.infer<typeof secretarySchema>;

// â”€â”€â”€ Confirm Delete â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ConfirmDeleteDialog({ secretary, onCancel, onConfirm, loading }: {
  secretary: Secretary; onCancel: () => void; onConfirm: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-md w-full max-w-sm p-7">
        <h3 className="text-base font-semibold text-gray-900 text-center">Supprimer ce compte ?</h3>
        <p className="text-sm text-gray-500 text-center mt-2">
          <span className="font-medium text-gray-700">{secretary.user?.name || secretary.full_name}</span> ne pourra plus se connecter.
        </p>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function DoctorSecretariesPage() {
  const [secretaries, setSecretaries]     = useState<Secretary[]>([]);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [togglingId, setTogglingId]       = useState<number | null>(null);
  const [deletingId, setDeletingId]       = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Secretary | null>(null);
  const [formError, setFormError]         = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<SecretaryFormValues>({ resolver: zodResolver(secretarySchema) });

  const fetchSecretaries = async () => {
    try { 
      const res = await doctorService.getSecretaries();
      // Handle the case where API returns { success: true, secretaries: [...] }
      setSecretaries(Array.isArray(res) ? res : (res as any).secretaries || []);
    }
    catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSecretaries(); }, []);

  const onSubmit = async (data: SecretaryFormValues) => {
    setSubmitting(true); setFormError(null);
    try {
      await doctorService.createSecretary({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        gender: data.gender,
        phone_number: data.phone_number
      });
      reset(); setShowForm(false); fetchSecretaries();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Ã‰chec de la crÃ©ation du compte.');
    } finally { setSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    setFormError(null);
    try {
      await doctorService.deleteSecretary(confirmDelete.id);
      setSecretaries(prev => prev.filter(s => s.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to delete account.');
      setConfirmDelete(null);
    } finally { 
      setDeletingId(null); 
    }
  };

  // Input style matching Figma (gray bg, rounded, no border ring)
  const inp = (err: boolean) => cn(
    'w-full rounded-xl px-3.5 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400',
    'border border-gray-200 bg-gray-50',
    err ? 'border-red-300 bg-red-50' : 'focus:border-[#1D9E75] focus:bg-white'
  );

  return (
    <DoctorLayout>
      <div className="max-w-2xl space-y-5 py-6">

      {/* â”€â”€ Header â”€â”€ */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mes secrÃ©taires</h1>
          <p className="text-sm text-gray-500 mt-0.5">GÃ©rer les comptes de vos secrÃ©taires</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setFormError(null); }}
            className="flex items-center gap-2 bg-[#1D9E75] hover:bg-[#15805d] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shrink-0"
          >
            <UserPlus size={15} /> Ajouter une secrÃ©taire
          </button>
        )}
      </div>

      {/* â”€â”€ Inline Create Form â”€â”€ */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          {/* Form title */}
          <div className="flex items-center gap-2 mb-5">
            <UserPlus size={17} className="text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">CrÃ©er un compte secrÃ©taire</h2>
          </div>

          {formError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm mb-4">
              <AlertCircle size={14} /> {formError}
            </div>
          )}

          <div className="space-y-4">
            {/* PrÃ©nom + Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">PrÃ©nom</label>
                <input
                  {...register('firstName')}
                  placeholder="PrÃ©nom"
                  className={inp(!!errors.firstName)}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Nom de famille</label>
                <input
                  {...register('lastName')}
                  placeholder="Nom de famille"
                  className={inp(!!errors.lastName)}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email + Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="secrÃ©taire@exemple.com"
                    className={cn(inp(!!errors.email), 'pl-9')}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Sexe</label>
                <select
                  {...register('gender')}
                  className={inp(!!errors.gender)}
                >
                  <option value="">SÃ©lectionner</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
              </div>
            </div>

            {/* TÃ©lÃ©phone */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">TÃ©lÃ©phone</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  {...register('phone_number')}
                  placeholder="0655418237"
                  className={cn(inp(!!errors.phone_number), 'pl-9')}
                />
              </div>
              {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number.message}</p>}
            </div>

            {/* Mot de passe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Mot de passe</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 caractÃ¨res"
                    className={cn(inp(!!errors.password), 'pl-9 pr-10')}
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Confirmer</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    {...register('password_confirmation')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirmer"
                    className={cn(inp(!!errors.password_confirmation), 'pl-9')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={() => { setShowForm(false); reset(); setFormError(null); }}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-[#1D9E75] hover:bg-[#15805d] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              CrÃ©er le compte
            </button>
          </div>
        </div>
      )}

      {/* â”€â”€ Secretary Cards â”€â”€ */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={26} className="animate-spin text-gray-300" />
        </div>
      ) : secretaries.length === 0 && !showForm ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-sm font-medium text-gray-600">Aucune secrÃ©taire</p>
          <p className="text-xs text-gray-400 mt-1">Cliquez sur "Ajouter une secrÃ©taire" pour crÃ©er un compte.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {secretaries.map(sec => {
            const name = sec.user?.name || sec.full_name || 'SecrÃ©taire';
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const isActive = true; // For now assuming active since backend model doesn't have status yet
            return (
              <div key={sec.id} className="bg-white border border-gray-200 rounded-2xl px-5 py-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  {/* Avatar + info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1D9E75] flex items-center justify-center text-sm font-bold shrink-0 border border-emerald-100">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500 font-medium">{sec.user?.email}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{sec.user?.phone_number}</p>
                    </div>
                  </div>

                  {/* Right icons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmDelete(sec)}
                      title="Supprimer"
                      className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* â”€â”€ Delete Confirm â”€â”€ */}
      {confirmDelete && (
        <ConfirmDeleteDialog
          secretary={confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleDeleteConfirm}
          loading={deletingId === confirmDelete.id}
        />
      )}
      </div>
    </DoctorLayout>
  );
}


