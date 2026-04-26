import { useState } from 'react'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { MOCK_SECRETARY } from '@/lib/mock/secretary.mock'

export function SecretarySettingsPage() {
  const [tab, setTab] = useState<'profil' | 'notifications' | 'securite'>('profil')
  return <SecretaryLayout title="Paramètres"><div className="flex gap-2 mb-3">{(['profil', 'notifications', 'securite'] as const).map((t) => <button key={t} className={`h-9 px-3 rounded border ${tab === t ? 'bg-[#E8F7F1] border-[#1D9E75]' : ''}`} onClick={() => setTab(t)}>{t}</button>)}</div><div className="bg-white border rounded-xl p-4">{tab === 'profil' && <div className="space-y-2"><p><b>Nom:</b> {MOCK_SECRETARY.firstName} {MOCK_SECRETARY.lastName}</p><p><b>Email:</b> {MOCK_SECRETARY.email}</p><p><b>Médecin assigné:</b> Dr. {MOCK_SECRETARY.assignedDoctor.firstName} {MOCK_SECRETARY.assignedDoctor.lastName}</p></div>}{tab === 'notifications' && <div className="space-y-2 text-sm"><label className="flex items-center justify-between border rounded p-2"><span>Nouveau rendez-vous créé</span><input type="checkbox" defaultChecked /></label><label className="flex items-center justify-between border rounded p-2"><span>Rendez-vous annulé</span><input type="checkbox" defaultChecked /></label></div>}{tab === 'securite' && <div className="grid gap-2 max-w-md"><input type="password" className="border rounded p-2" placeholder="Mot de passe actuel" /><input type="password" className="border rounded p-2" placeholder="Nouveau mot de passe" /><input type="password" className="border rounded p-2" placeholder="Confirmer nouveau mot de passe" /><button className="h-10 rounded bg-[#1D9E75] text-white">Modifier</button></div>}</div></SecretaryLayout>
}

