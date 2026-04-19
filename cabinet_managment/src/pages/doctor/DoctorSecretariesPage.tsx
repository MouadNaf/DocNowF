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

// ─── Schema ──────────────────────────────────────────────────────────────────
const secretarySchema = z.object({
  firstName: z.string().min(2, 'Requis'),
  lastName:  z.string().min(2, 'Requis'),
  email:     z.string().email('Email invalide'),
  password:  z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  phone:     z.string().optional(),
});
type SecretaryFormValues = z.infer<typeof secretarySchema>;

// ─── Confirm Delete ──────────────────────────────────────────────────────────
function ConfirmDeleteDialog({ secretary, onCancel, onConfirm, loading }: {
  secretary: Secretary; onCancel: () => void; onConfirm: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-7">
        <h3 className="text-base font-semibold text-gray-900 text-center">Supprimer ce compte ?</h3>
        <p className="text-sm text-gray-500 text-center mt-2">
          <span className="font-medium text-gray-700">{secretary.full_name}</span> ne pourra plus se connecter.
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

// ─── Page ────────────────────────────────────────────────────────────────────
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
    try { setSecretaries(await doctorService.getSecretaries()); }
    catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSecretaries(); }, []);

  const onSubmit = async (data: SecretaryFormValues) => {
    setSubmitting(true); setFormError(null);
    try {
      await doctorService.createSecretary(data);
      reset(); setShowForm(false); fetchSecretaries();
    } catch (err: any) {
      setFormError(err?.response?.data?.detail || 'Échec de la création du compte.');
    } finally { setSubmitting(false); }
  };

  const handleToggle = async (sec: Secretary) => {
    setTogglingId(sec.id);
    try {
      const updated = await doctorService.toggleSecretaryStatus(sec.id);
      setSecretaries(prev => prev.map(s => s.id === updated.id ? updated : s));
    } finally { setTogglingId(null); }
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
      setFormError(err?.response?.data?.detail || 'Failed to delete account.');
      setConfirmDelete(null); // Close the dialog so user sees the error
    } finally { 
      setDeletingId(null); 
    }
  };

  // Input style matching Figma (gray bg, rounded, no border ring)
  const inp = (err: boolean) => cn(
    'w-full rounded-xl px-3.5 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400',
    'border border-gray-200 bg-gray-50',
    err ? 'border-red-300 bg-red-50' : 'focus:border-blue-400 focus:bg-white'
  );

  return (
    <DoctorLayout>
      <div className="max-w-2xl space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mes secrétaires</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérer les comptes de vos secrétaires</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setFormError(null); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shrink-0"
          >
            <UserPlus size={15} /> Ajouter une secrétaire
          </button>
        )}
      </div>

      {/* ── Inline Create Form ── */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          {/* Form title */}
          <div className="flex items-center gap-2 mb-5">
            <UserPlus size={17} className="text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">Créer un compte secrétaire</h2>
          </div>

          {formError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm mb-4">
              <AlertCircle size={14} /> {formError}
            </div>
          )}

          <div className="space-y-3.5">
            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                <input
                  {...register('firstName')}
                  placeholder="Prénom"
                  className={inp(!!errors.firstName)}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de famille</label>
                <input
                  {...register('lastName')}
                  placeholder="Nom de famille"
                  className={inp(!!errors.lastName)}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="secrétaire@exemple.com"
                  className={cn(inp(!!errors.email), 'pl-9')}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  {...register('phone')}
                  placeholder="+33 6 12 34 56 78"
                  className={cn(inp(false), 'pl-9')}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 caractères"
                  className={cn(inp(!!errors.password), 'pl-9 pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password
                ? <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                : <p className="text-gray-400 text-xs mt-1">Le mot de passe doit contenir au moins 6 caractères</p>
              }
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-5">
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
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Créer le compte
            </button>
          </div>
        </div>
      )}

      {/* ── Secretary Cards ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={26} className="animate-spin text-gray-300" />
        </div>
      ) : secretaries.length === 0 && !showForm ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-sm font-medium text-gray-600">Aucune secrétaire</p>
          <p className="text-xs text-gray-400 mt-1">Cliquez sur "Ajouter une secrétaire" pour créer un compte.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {secretaries.map(sec => {
            const initials = sec.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const isActive = sec.status === 'ACTIVE';
            return (
              <div key={sec.id} className="bg-white border border-gray-200 rounded-2xl px-4 py-4">
                <div className="flex items-center justify-between">
                  {/* Avatar + info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{sec.full_name}</p>
                      <p className="text-xs text-gray-500">{sec.email}</p>
                    </div>
                  </div>

                  {/* Right icons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggle(sec)}
                      disabled={togglingId === sec.id}
                      title={isActive ? 'Désactiver' : 'Activer'}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      {togglingId === sec.id
                        ? <Loader2 size={15} className="animate-spin" />
                        : <Copy size={15} />
                      }
                    </button>
                    <button
                      onClick={() => setConfirmDelete(sec)}
                      title="Supprimer"
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Status badge */}
                <div className="mt-3 pl-[52px]">
                  <button
                    onClick={() => handleToggle(sec)}
                    disabled={togglingId === sec.id}
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full transition-colors',
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    )}
                  >
                    {isActive && <CheckCircle2 size={11} strokeWidth={2.5} />}
                    {isActive ? 'Actif' : 'Inactif'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete Confirm ── */}
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
