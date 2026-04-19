import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppointmentStore } from '@/store/appointment.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Patient, VisitType } from '@/types/secretary.types';

interface Props {
  onClose: () => void;
}

export function CreateAppointmentModal({ onClose }: Props) {
  const { patients, addPatient, addAppointment } = useAppointmentStore();

  // Step 1 — Patient
  const [phone, setPhone] = useState('');
  const [foundPatient, setFoundPatient] = useState<Patient | null | undefined>(undefined); // undefined = not searched yet
  const [newName, setNewName] = useState('');

  // Step 2 — Appointment details
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [visitType, setVisitType] = useState<VisitType>('Première visite');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    const cleaned = val.replace(/\s/g, '');
    if (cleaned.length >= 9) {
      const match = patients.find((p) =>
        p.phone.replace(/\s/g, '').includes(cleaned)
      );
      setFoundPatient(match ?? null); // null = not found
    } else {
      setFoundPatient(undefined); // not searched yet
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let patientId = foundPatient?.id;

    if (!patientId) {
      // Create new patient on the fly
      const newP = addPatient({ name: newName, phone });
      patientId = newP.id;
    }

    addAppointment({ patientId, date, time, visitType, notes });
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Créer un rendez-vous</h2>
            <p className="text-xs text-gray-400 mt-0.5">Remplissez les informations ci-dessous</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* ── Patient ── */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600">
              1 · Patient
            </h3>

            <Input
              label="Téléphone"
              type="text"
              inputMode="numeric"
              placeholder="0555 123 456"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              required
            />

            {/* Found */}
            {foundPatient && (
              <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {foundPatient.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">{foundPatient.name}</p>
                  <p className="text-xs text-green-600">{foundPatient.phone}</p>
                </div>
              </div>
            )}

            {/* Not found → create inline */}
            {foundPatient === null && (
              <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-semibold text-amber-700">
                  Numéro inconnu — créer un nouveau patient
                </p>
                <Input
                  label="Nom complet"
                  type="text"
                  placeholder="Ex: Amine Benali"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
            )}
          </section>

          {/* ── Date / Time ── */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600">
              2 · Date &amp; Heure
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Date"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <Input
                label="Heure"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </section>

          {/* ── Visit type ── */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600">
              3 · Type de visite
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(['Première visite', 'Suivi'] as VisitType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setVisitType(t)}
                  className={[
                    'px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all',
                    visitType === t
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                  ].join(' ')}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* ── Notes ── */}
          <section className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Notes (optionnel)
            </label>
            <textarea
              rows={2}
              placeholder="Motif, remarques…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
            />
          </section>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={submitting}>
              Confirmer le rendez-vous
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
