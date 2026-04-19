import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { Button } from '@/components/ui/Button';
import { CreateAppointmentModal } from '@/components/secretary/CreateAppointmentModal';
import { useAuthStore } from '@/store/auth.store';
import { useAppointmentStore } from '@/store/appointment.store';
import { ROUTES } from '@/constants/routes';
import type { AppointmentStatus } from '@/types/secretary.types';

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const STATUS_DOT: Record<AppointmentStatus, string> = {
  Confirmé:  'bg-blue-400',
  Arrivé:    'bg-purple-400',
  Terminé:   'bg-emerald-400',
  'No-show': 'bg-orange-400',
  Annulé:    'bg-red-400',
};

const STATUS_PILL: Record<AppointmentStatus, string> = {
  Confirmé:  'bg-blue-100 text-blue-800',
  Arrivé:    'bg-purple-100 text-purple-800',
  Terminé:   'bg-emerald-100 text-emerald-800',
  'No-show': 'bg-orange-100 text-orange-800',
  Annulé:    'bg-red-100 text-red-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toISO = (d: Date) => d.toISOString().split('T')[0];

const getWeekDates = (base: Date): Date[] => {
  const monday = new Date(base);
  monday.setDate(base.getDate() - ((base.getDay() + 6) % 7)); // ISO Mon=0
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export function SecretaryCalendarPage() {
  const navigate = useNavigate();
  const logout   = useAuthStore((s) => s.logout);

  const appointments = useAppointmentStore((s) => s.appointments);
  const patients     = useAppointmentStore((s) => s.patients);

  const [weekBase, setWeekBase]     = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(toISO(new Date()));
  const [showModal, setShowModal]   = useState(false);

  const handleLogout = () => { logout(); navigate(ROUTES.LOGIN, { replace: true }); };

  const weekDates = useMemo(() => getWeekDates(weekBase), [weekBase]);

  const prevWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); };
  const nextWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); };
  const goToday  = () => { setWeekBase(new Date()); setSelectedDay(toISO(new Date())); };

  // Appointments for selected day sorted by time
  const dayAppointments = useMemo(() =>
    appointments
      .filter((a) => a.date === selectedDay)
      .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, selectedDay]
  );

  // Count per day for the week
  const countForDate = (iso: string) => appointments.filter((a) => a.date === iso).length;
  const today = toISO(new Date());

  const monthLabel = (() => {
    const first = weekDates[0];
    const last  = weekDates[6];
    if (first.getMonth() === last.getMonth()) {
      return `${MONTHS_FR[first.getMonth()]} ${first.getFullYear()}`;
    }
    return `${MONTHS_FR[first.getMonth()]} – ${MONTHS_FR[last.getMonth()]} ${last.getFullYear()}`;
  })();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role="secretary" onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* ── Header ── */}
        <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-8 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Calendrier</h1>
            <p className="text-xs text-gray-400">{monthLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button onClick={prevWeek} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition"><ChevronLeft size={18} /></button>
              <button onClick={goToday} className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-50 text-gray-700 transition">Aujourd'hui</button>
              <button onClick={nextWeek} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition"><ChevronRight size={18} /></button>
            </div>
            <Button onClick={() => setShowModal(true)} size="sm" className="flex items-center gap-1.5">
              <Plus size={16} strokeWidth={2.5} /> Nouveau RDV
            </Button>
          </div>
        </header>

        {/* ── Week strip ── */}
        <div className="grid grid-cols-7 gap-2 px-8 py-4 bg-white border-b border-gray-100 shrink-0">
          {weekDates.map((d) => {
            const iso    = toISO(d);
            const count  = countForDate(iso);
            const isToday = iso === today;
            const isSel  = iso === selectedDay;

            return (
              <button
                key={iso}
                onClick={() => setSelectedDay(iso)}
                className={[
                  'flex flex-col items-center py-3 rounded-2xl transition-all',
                  isSel
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : isToday
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-300'
                    : 'hover:bg-gray-50 text-gray-700',
                ].join(' ')}
              >
                <span className={['text-[10px] font-semibold uppercase tracking-widest mb-1',
                  isSel ? 'text-blue-100' : 'text-gray-400'].join(' ')}>
                  {DAYS_FR[d.getDay()]}
                </span>
                <span className="text-lg font-bold">{d.getDate()}</span>
                {count > 0 && (
                  <span className={['mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full',
                    isSel ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'].join(' ')}>
                    {count} RDV
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Day detail ── */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              {new Date(selectedDay + 'T00:00:00').toLocaleDateString('fr-DZ', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </h2>
            <span className="text-sm font-semibold text-gray-400">
              {dayAppointments.length} rendez-vous
            </span>
          </div>

          {dayAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-gray-400">
              <Clock size={44} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">Aucun rendez-vous ce jour</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
              >
                + Créer un rendez-vous
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-w-2xl">
              {dayAppointments.map((apt) => {
                const patient  = patients.find((p) => p.id === apt.patientId);
                const initials = patient?.name.split(' ').slice(0, 2).map((w) => w[0]).join('') ?? '?';

                return (
                  <div key={apt.id}
                    className="bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-4 px-5 py-4 hover:shadow-md transition-all">
                    {/* Time */}
                    <div className="text-center shrink-0 w-14">
                      <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1 ${STATUS_DOT[apt.status]}`} />
                      <p className="text-sm font-bold text-gray-900">{apt.time}</p>
                    </div>

                    <div className="w-px h-10 bg-gray-100 shrink-0" />

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{patient?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{apt.visitType} • {patient?.phone}</p>
                    </div>

                    {/* Status + Payment */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${STATUS_PILL[apt.status]}`}>
                        {apt.status}
                      </span>
                      <span className={`text-[11px] font-semibold ${apt.paymentStatus === 'Payé' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {apt.paymentStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {showModal && <CreateAppointmentModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
