import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Phone, UserPlus, CheckCircle, X, AlertTriangle, Calendar } from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth.store';
import { useAppointmentStore } from '@/store/appointment.store';
import { ROUTES } from '@/constants/routes';
import type { WaitingEntry } from '@/types/secretary.types';

// ─── Add to waiting list modal ───────────────────────────────────────────────
function AddToWaitingModal({ onClose }: { onClose: () => void }) {
  const { patients, addPatient, addToWaitingList } = useAppointmentStore();
  const [phone, setPhone]       = useState('');
  const [foundId, setFoundId]   = useState<string | null | undefined>(undefined);
  const [newName, setNewName]   = useState('');
  const [reason, setReason]     = useState('');
  const [priority, setPriority] = useState<WaitingEntry['priority']>('normal');

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    const cleaned = val.replace(/\s/g, '');
    if (cleaned.length >= 9) {
      const p = patients.find((pt) => pt.phone.replace(/\s/g, '').includes(cleaned));
      setFoundId(p?.id ?? null);
    } else {
      setFoundId(undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let patientId = foundId ?? undefined;
    if (!patientId) {
      const p = addPatient({ name: newName, phone });
      patientId = p.id;
    }
    addToWaitingList({ patientId, reason, priority });
    onClose();
  };

  const found = foundId ? patients.find((p) => p.id === foundId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Ajouter à la liste d'attente</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Téléphone" type="text" inputMode="numeric" placeholder="0555 123 456"
            value={phone} onChange={(e) => handlePhoneChange(e.target.value)} required />
          {found && (
            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">{found.name[0]}</div>
              <div>
                <p className="text-sm font-bold text-green-800">{found.name}</p>
                <p className="text-xs text-green-600">{found.phone}</p>
              </div>
            </div>
          )}
          {foundId === null && (
            <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-semibold text-amber-700">Nouveau patient — saisir le nom</p>
              <Input label="Nom complet" placeholder="Ex: Amine Benali" value={newName} onChange={(e) => setNewName(e.target.value)} required />
            </div>
          )}
          <Input label="Motif (optionnel)" placeholder="Ex: Douleur, fièvre…" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Priorité</label>
            <div className="grid grid-cols-2 gap-3">
              {(['normal', 'urgent'] as const).map((p) => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={['px-4 py-2.5 rounded-xl border-2 text-sm font-semibold capitalize transition', priority === p
                    ? p === 'urgent' ? 'border-red-500 bg-red-50 text-red-700' : 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'].join(' ')}>
                  {p === 'urgent' ? '🔴 Urgent' : '🔵 Normal'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit"><UserPlus size={15} className="mr-1" /> Ajouter</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Promote (convert waiting → appointment) modal ───────────────────────────
function PromoteModal({ entry, onClose }: { entry: WaitingEntry; onClose: () => void }) {
  const promoteFromWaiting = useAppointmentStore((s) => s.promoteFromWaiting);
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    promoteFromWaiting(entry.id, date, time);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Planifier un RDV</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required />
            <Input label="Heure" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit"><Calendar size={15} className="mr-1" /> Confirmer RDV</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function SecretaryWaitingListPage() {
  const navigate  = useNavigate();
  const logout    = useAuthStore((s) => s.logout);
  const patients  = useAppointmentStore((s) => s.patients);
  const waiting   = useAppointmentStore((s) => s.waitingList);
  const removeFromWaiting = useAppointmentStore((s) => s.removeFromWaiting);

  const [showAdd, setShowAdd]               = useState(false);
  const [promoting, setPromoting]           = useState<WaitingEntry | null>(null);

  const handleLogout = () => { logout(); navigate(ROUTES.LOGIN, { replace: true }); };

  const fmtWait = (iso: string) => {
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'À l\'instant';
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}min`;
  };

  const sorted = [...waiting].sort((a, b) => {
    if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
    if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
    return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role="secretary" onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-8 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Liste d'attente</h1>
            <p className="text-xs text-gray-400">{waiting.length} patient{waiting.length > 1 ? 's' : ''} en attente</p>
          </div>
          <Button onClick={() => setShowAdd(true)} size="sm" className="flex items-center gap-1.5">
            <UserPlus size={16} strokeWidth={2.5} /> Ajouter un patient
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <CheckCircle size={48} className="mb-3 opacity-20" />
              <p className="text-base font-semibold">Aucun patient en attente</p>
              <p className="text-sm mt-1">La salle d'attente est vide.</p>
            </div>
          )}

          <div className="space-y-3 max-w-3xl mx-auto">
            {sorted.map((entry, idx) => {
              const patient = patients.find((p) => p.id === entry.patientId);
              const initials = patient?.name.split(' ').slice(0, 2).map((w) => w[0]).join('') ?? '?';
              const isUrgent = entry.priority === 'urgent';

              return (
                <div
                  key={entry.id}
                  className={[
                    'bg-white rounded-2xl border shadow-sm flex items-center gap-4 px-5 py-4 transition-all',
                    isUrgent ? 'border-red-200 shadow-red-50' : 'border-gray-100',
                  ].join(' ')}
                >
                  {/* Position */}
                  <span className={['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                    isUrgent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'].join(' ')}>
                    {idx + 1}
                  </span>

                  {/* Avatar */}
                  <div className={['w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0',
                    isUrgent ? 'bg-gradient-to-br from-red-500 to-orange-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'].join(' ')}>
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{patient?.name ?? '—'}</p>
                      {isUrgent && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">
                          <AlertTriangle size={10} /> URGENT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1"><Phone size={10} />{patient?.phone}</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{fmtWait(entry.addedAt)}</span>
                      {entry.reason && <span className="italic">— {entry.reason}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPromoting(entry)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                    >
                      <Calendar size={13} /> Planifier RDV
                    </button>
                    <button
                      onClick={() => removeFromWaiting(entry.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {showAdd && <AddToWaitingModal onClose={() => setShowAdd(false)} />}
      {promoting && <PromoteModal entry={promoting} onClose={() => setPromoting(null)} />}
    </div>
  );
}
