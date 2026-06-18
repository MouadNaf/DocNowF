import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { useAuthStore } from '@/store/auth.store'
import { useSecretaryProfile } from '@/hooks/useSecretary'

export function SecretarySettingsPage() {
  const [tab, setTab] = useState<'profil' | 'notifications' | 'securite'>('profil')
  const user = useAuthStore((s) => s.user)
  const { isLoading } = useSecretaryProfile()

  const doctorDisplay = user?.assignedDoctor?.name
    ? (user.assignedDoctor.name.startsWith('Dr.') ? user.assignedDoctor.name : `Dr. ${user.assignedDoctor.name}`)
    : 'Non assigné'

  return (
    <SecretaryLayout title="Paramètres">
      <div className="max-w-3xl">
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl shadow-sm w-fit">
          {(['profil', 'notifications', 'securite'] as const).map((t) => (
            <button 
              key={t} 
              className={`h-11 px-6 rounded-xl font-medium text-sm transition-all capitalize ${tab === t ? 'bg-[#1D9E75] text-white shadow-sm shadow-[#1D9E75]/20' : 'text-gray-500 hover:bg-gray-50'}`} 
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
              <Loader2 className="animate-spin text-[#1D9E75]" size={24} />
              <span className="text-sm font-medium">Chargement du profil...</span>
            </div>
          ) : tab === 'profil' && (
            <div className="space-y-4 text-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations du compte</h3>
              <div className="grid gap-4">
                <div className="p-4 bg-gray-50/50 rounded-xl">
                  <p className="text-gray-500 mb-1">Nom complet</p>
                  <p className="font-semibold text-gray-800">{`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || '—'}</p>
                </div>
                <div className="p-4 bg-gray-50/50 rounded-xl">
                  <p className="text-gray-500 mb-1">Adresse email</p>
                  <p className="font-semibold text-gray-800">{user?.email ?? '—'}</p>
                </div>
                <div className="p-4 bg-gray-50/50 rounded-xl">
                  <p className="text-gray-500 mb-1">Téléphone</p>
                  <p className="font-semibold text-gray-800">{user?.phone_number ?? '—'}</p>
                </div>
                <div className="p-4 bg-gray-50/50 rounded-xl">
                  <p className="text-gray-500 mb-1">Ville</p>
                  <p className="font-semibold text-gray-800">{user?.city ?? '—'}</p>
                </div>
                <div className="p-4 bg-gray-50/50 rounded-xl">
                  <p className="text-gray-500 mb-1">Médecin assigné</p>
                  <p className="font-semibold text-gray-800">{doctorDisplay}</p>
                  {user?.assignedDoctor?.speciality && (
                    <p className="text-xs text-gray-500 mt-1">{user.assignedDoctor.speciality}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {!isLoading && tab === 'notifications' && (
            <div className="space-y-4 text-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Préférences de notification</h3>
              <label className="flex items-center justify-between bg-gray-50/50 hover:bg-gray-50 rounded-xl p-4 transition-colors cursor-pointer">
                <span className="font-medium text-gray-700">Nouveau rendez-vous créé</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-[#1D9E75] focus:ring-[#1D9E75]" />
              </label>
              <label className="flex items-center justify-between bg-gray-50/50 hover:bg-gray-50 rounded-xl p-4 transition-colors cursor-pointer">
                <span className="font-medium text-gray-700">Rendez-vous annulé</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-[#1D9E75] focus:ring-[#1D9E75]" />
              </label>
            </div>
          )}
          
          {!isLoading && tab === 'securite' && (
            <div className="space-y-4 text-sm max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Changer le mot de passe</h3>
              <div className="grid gap-4">
                <input type="password" className="w-full bg-gray-50 text-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1D9E75]/20 transition-all placeholder:text-gray-400" placeholder="Mot de passe actuel" />
                <input type="password" className="w-full bg-gray-50 text-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1D9E75]/20 transition-all placeholder:text-gray-400" placeholder="Nouveau mot de passe" />
                <input type="password" className="w-full bg-gray-50 text-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1D9E75]/20 transition-all placeholder:text-gray-400" placeholder="Confirmer nouveau mot de passe" />
                <button className="mt-2 h-12 rounded-xl bg-[#1D9E75] hover:bg-[#168260] text-white font-medium transition-all shadow-sm shadow-[#1D9E75]/20">Modifier le mot de passe</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SecretaryLayout>
  )
}
