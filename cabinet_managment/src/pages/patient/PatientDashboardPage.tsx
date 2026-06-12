import { 
  Calendar, 
  Clock, 
  Heart, 
  FileText, 
  ArrowUpRight,
  Plus,
  Activity,
  Droplet,
  Thermometer
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function PatientDashboardPage() {
  const stats = [
    { label: 'Rendez-vous', value: '03', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
    { label: 'Favoris', value: '12', icon: Heart, color: 'bg-pink-50 text-pink-600' },
    { label: 'Consultations', value: '24', icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Analyses', value: '05', icon: Activity, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Bonjour, Patient 👋</h1>
          <p className="text-gray-500 font-medium">Voici un aperçu de votre santé aujourd'hui.</p>
        </div>
        <Link to={ROUTES.DOCTORS}>
          <Button className="bg-[#1D9E75] hover:bg-[#15805d] rounded-2xl h-12 px-6 font-bold shadow-lg shadow-emerald-100">
            <Plus size={18} className="mr-2" /> Prendre un rendez-vous
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Vital Signs (Mock) */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900">Signes Vitaux</h3>
                <span className="text-xs font-bold text-gray-400">Dernière mise à jour: Aujourd'hui, 09:00</span>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <VitalCard icon={<Droplet size={20} />} label="Groupe Sanguin" value="O+" color="text-red-600" bg="bg-red-50" />
                <VitalCard icon={<Activity size={20} />} label="Battements" value="72 bpm" color="text-emerald-600" bg="bg-emerald-50" />
                <VitalCard icon={<Thermometer size={20} />} label="Température" value="36.6 °C" color="text-orange-600" bg="bg-orange-50" />
             </div>
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900">Rendez-vous à venir</h3>
                <Button variant="ghost" className="text-sm font-bold text-[#1D9E75]">Voir tout</Button>
             </div>
             <div className="space-y-4">
                <AppointmentRow 
                  doctor="Dr. Ahmed Benali" 
                  specialty="Cardiologue" 
                  date="18 Mai 2026" 
                  time="10:30" 
                  image="https://i.pravatar.cc/100?img=11"
                />
                <AppointmentRow 
                  doctor="Dr. Sarah Mansouri" 
                  specialty="Dentiste" 
                  date="22 Mai 2026" 
                  time="14:00" 
                  image="https://i.pravatar.cc/100?img=25"
                />
             </div>
           </div>
        </div>

        {/* AI Health Tips */}
        <div className="space-y-6">
          <div className="bg-[#1D9E75] p-8 rounded-[40px] text-white relative overflow-hidden shadow-xl shadow-emerald-100">
             <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <h3 className="text-xl font-bold">Conseil Santé IA</h3>
                <p className="text-sm text-emerald-50 leading-relaxed font-medium">
                  "Il semble faire très chaud aujourd'hui à Alger. N'oubliez pas de boire au moins 2 litres d'eau pour rester hydraté !"
                </p>
                <Button className="w-full bg-white text-[#1D9E75] hover:bg-emerald-50 rounded-xl font-bold">
                  Parler à l'assistant
                </Button>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 mb-6">Analyses Récentes</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                         <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Bilan Sanguin</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">12 Avr 2026</p>
                      </div>
                   </div>
                   <button className="text-gray-400 hover:text-gray-900 transition-colors">
                      <ArrowUpRight size={20} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VitalCard({ icon, label, value, color, bg }: { icon: React.ReactNode, label: string, value: string, color: string, bg: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-[32px] bg-gray-50 border border-gray-100">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm", bg, color)}>
        {icon}
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={cn("text-xl font-black", color)}>{value}</p>
    </div>
  );
}

function AppointmentRow({ doctor, specialty, date, time, image }: { doctor: string, specialty: string, date: string, time: string, image: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-[24px] hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
          <img src={image} alt={doctor} />
        </div>
        <div>
          <p className="text-sm font-black text-gray-900">{doctor}</p>
          <p className="text-xs font-bold text-gray-400">{specialty}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">{date}</p>
        <p className="text-[10px] font-bold text-[#1D9E75] uppercase tracking-widest bg-[#E8F7F1] px-2 py-0.5 rounded-lg inline-block">{time}</p>
      </div>
    </div>
  );
}
