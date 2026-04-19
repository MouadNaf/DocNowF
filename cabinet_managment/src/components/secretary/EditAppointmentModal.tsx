import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppointmentStore } from '@/store/appointment.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Appointment, VisitType } from '@/types/secretary.types';

interface Props {
  appointment: Appointment;
  onClose: () => void;
}

export function EditAppointmentModal({ appointment, onClose }: Props) {
  const updateAppointment = useAppointmentStore((s) => s.updateAppointment);

  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState(appointment.time);
  const [visitType, setVisitType] = useState<VisitType>(appointment.visitType);
  const [notes, setNotes] = useState(appointment.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppointment(appointment.id, { date, time, visitType, notes });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Modifier le rendez-vous</h2>
            <p className="text-xs text-gray-400 mt-0.5">Mettez à jour les informations du rendez-vous</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date / Time */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
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

          {/* Visit type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
              Type de visite
            </label>
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
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Motif, remarques…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
