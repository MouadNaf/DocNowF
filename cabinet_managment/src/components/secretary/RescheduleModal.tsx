import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppointmentStore } from '@/store/appointment.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Appointment } from '@/types/secretary.types';

interface Props {
  appointment: Appointment;
  onClose: () => void;
}

export function RescheduleModal({ appointment, onClose }: Props) {
  const reschedule = useAppointmentStore((s) => s.reschedule);
  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState(appointment.time);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reschedule(appointment.id, date, time);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Replanifier</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nouvelle date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              label="Nouvelle heure"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Replanifier</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
