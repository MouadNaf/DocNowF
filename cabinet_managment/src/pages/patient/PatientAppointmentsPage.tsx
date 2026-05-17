import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PatientAppointmentsPage() {
  const appointments = [
    { id: 1, doctor: 'Dr. Ahmed Benali', specialty: 'Cardiologue', date: '18 Mai 2026', time: '10:30', status: 'confirmé', image: 'https://i.pravatar.cc/100?img=11' },
    { id: 2, doctor: 'Dr. Sarah Mansouri', specialty: 'Dentiste', date: '22 Mai 2026', time: '14:00', status: 'en attente', image: 'https://i.pravatar.cc/100?img=25' },
    { id: 3, doctor: 'Dr. Kamel Ziri', specialty: 'Ophtalmologue', date: '05 Juin 2026', time: '09:15', status: 'confirmé', image: 'https://i.pravatar.cc/100?img=33' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900">Mes Rendez-vous</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 shadow-sm">À venir</button>
          <button className="px-4 py-2 text-sm font-bold text-gray-400">Passés</button>
        </div>
      </div>

      <div className="grid gap-6">
        {appointments.map((apt) => (
          <div key={apt.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[20px] overflow-hidden bg-gray-100 border-4 border-gray-50 shadow-sm">
                <img src={apt.image} alt={apt.doctor} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">{apt.doctor}</h3>
                <p className="text-sm font-bold text-[#1D9E75]">{apt.specialty}</p>
                <div className="flex items-center gap-3 mt-2 text-gray-400">
                   <span className="flex items-center gap-1 text-[10px] font-bold uppercase"><Calendar size={12} /> {apt.date}</span>
                   <span className="flex items-center gap-1 text-[10px] font-bold uppercase"><Clock size={12} /> {apt.time}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={apt.status === 'confirmé' ? "bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold" : "bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-xs font-bold"}>
                {apt.status === 'confirmé' ? 'Confirmé' : 'En attente'}
              </div>
              <Button variant="outline" className="rounded-xl font-bold text-sm">Détails</Button>
              <button className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
