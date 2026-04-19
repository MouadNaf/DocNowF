import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, SlidersHorizontal, Users } from 'lucide-react';

import { Sidebar } from '@/components/ui/Sidebar';
import { Button } from '@/components/ui/Button';
import { AppointmentCard } from '@/components/secretary/AppointmentCard';
import { CreateAppointmentModal } from '@/components/secretary/CreateAppointmentModal';
import { useAuthStore } from '@/store/auth.store';
import { useAppointmentStore } from '@/store/appointment.store';
import { ROUTES } from '@/constants/routes';
import type { AppointmentStatus, PaymentStatus } from '@/types/secretary.types';

// ─── Types ───────────────────────────────────────────────────────────────────
type FilterStatus = 'Tous' | AppointmentStatus | PaymentStatus;

const STATUS_FILTERS: FilterStatus[] = [
  'Tous', 'Confirmé', 'Arrivé', 'Terminé', 'No-show', 'Annulé', 'Payé', 'Non payé',
];

const STATUS_PILL_ACTIVE: Record<FilterStatus, string> = {
  Tous:       'bg-gray-900 text-white border-transparent',
  Confirmé:   'bg-blue-600 text-white border-transparent',
  Arrivé:     'bg-purple-600 text-white border-transparent',
  Terminé:    'bg-emerald-600 text-white border-transparent',
  'No-show':  'bg-orange-500 text-white border-transparent',
  Annulé:     'bg-red-500 text-white border-transparent',
  Payé:       'bg-emerald-500 text-white border-transparent',
  'Non payé': 'bg-amber-500 text-white border-transparent',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export function SecretaryAppointmentsPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const appointments = useAppointmentStore((s) => s.appointments);
  const patients     = useAppointmentStore((s) => s.patients);

  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<FilterStatus>('Tous');
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => { logout(); navigate(ROUTES.LOGIN, { replace: true }); };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter((a) => a.date === today);
  const stats = [
    { label: "Aujourd'hui",  value: todayApts.length,                                                      color: 'text-gray-900',   bg: 'bg-gray-50',    border: 'border-gray-200' },
    { label: 'Confirmés',   value: todayApts.filter((a) => a.status === 'Confirmé').length,                color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-100' },
    { label: 'Arrivés',     value: todayApts.filter((a) => a.status === 'Arrivé').length,                  color: 'text-purple-600', bg: 'bg-purple-50',  border: 'border-purple-100' },
    { label: 'Terminés',    value: todayApts.filter((a) => a.status === 'Terminé').length,                 color: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'À encaisser', value: todayApts.filter((a) => a.status === 'Terminé' && a.paymentStatus === 'Non payé').length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Annulés',     value: todayApts.filter((a) => a.status === 'Annulé').length,                  color: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-100' },
  ];

  // ─── Filtered list ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().replace(/\s/g, '');
    return appointments
      .filter((apt) => {
        const p = patients.find((x) => x.id === apt.patientId);
        const matchSearch = !q
          || p?.name.toLowerCase().replace(/\s/g, '').includes(q)
          || p?.phone.replace(/\s/g, '').includes(q);
        const matchFilter = filter === 'Tous' || apt.status === filter || apt.paymentStatus === filter;
        return matchSearch && matchFilter;
      })
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  }, [appointments, patients, search, filter]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role="secretary" onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* ── Header ── */}
        <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-8 shrink-0 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Rendez-vous</h1>
            <p className="text-xs text-gray-400">{appointments.length} au total</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.SECRETARY_WAITING)} className="flex items-center gap-1.5 hidden sm:flex">
              <Users size={15} /> Liste d'attente
            </Button>
            <Button onClick={() => setShowModal(true)} size="sm" className="flex items-center gap-1.5">
              <Plus size={16} strokeWidth={2.5} /> Nouveau RDV
            </Button>
          </div>
        </header>

        {/* ── Stats bar ── */}
        <div className="flex gap-3 px-8 py-3 bg-white border-b border-gray-100 shrink-0 overflow-x-auto">
          {stats.map((s) => (
            <button
              key={s.label}
              onClick={() => setFilter(s.label === "Aujourd'hui" ? 'Tous' : s.label as FilterStatus)}
              className={[
                'flex flex-col items-center px-4 py-2 rounded-xl border shrink-0 transition hover:shadow-sm cursor-pointer',
                s.bg, s.border,
              ].join(' ')}
            >
              <span className={`text-xl font-extrabold ${s.color}`}>{s.value}</span>
              <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{s.label}</span>
            </button>
          ))}
        </div>

        {/* ── Search + Filter pills ── */}
        <div className="px-8 pt-5 pb-0 shrink-0 space-y-3">
          <div className="flex gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher par nom ou téléphone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            {/* Mobile select */}
            <div className="relative sm:hidden">
              <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterStatus)}
                className="h-10 w-40 appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-800 outline-none focus:border-blue-400 transition"
              >
                {STATUS_FILTERS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Filter pills — desktop */}
          <div className="hidden sm:flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                  filter === f
                    ? STATUS_PILL_ACTIVE[f]
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                ].join(' ')}
              >
                {f}
              </button>
            ))}
            {filter !== 'Tous' && (
              <button onClick={() => setFilter('Tous')} className="text-xs text-gray-400 hover:text-gray-600 px-2 underline transition">
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* ── Card grid ── */}
        <main className="flex-1 min-h-0 overflow-y-auto px-8 py-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-gray-400">
              <Search size={40} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">Aucun rendez-vous trouvé</p>
              <p className="text-xs mt-1 text-gray-300">Modifiez vos filtres ou créez un nouveau rendez-vous</p>
              <button onClick={() => setShowModal(true)} className="mt-4 text-xs font-semibold text-blue-600 hover:underline">
                + Créer un rendez-vous
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pb-10">
              {filtered.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} role="secretary" />
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && <CreateAppointmentModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
