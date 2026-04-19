import React from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Clock,
  ArrowUpRight,
  UserPlus,
  ShoppingBag,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { cn } from '@/lib/utils/cn';
import { adminService } from '@/services/admin.service';
import { useEffect, useState } from 'react';

const userData = [
  { name: 'Jan', users: 120 },
  { name: 'Feb', users: 145 },
  { name: 'Mar', users: 170 },
  { name: 'Apr', users: 195 },
  { name: 'May', users: 220 },
  { name: 'Jun', users: 248 },
];

const revenueData = [
  { name: 'Jan', revenue: 12000 },
  { name: 'Feb', revenue: 15600 },
  { name: 'Mar', revenue: 14200 },
  { name: 'Apr', revenue: 16800 },
  { name: 'May', revenue: 19200 },
  { name: 'Jun', revenue: 22400 },
];

const activity = [
  { id: 1, type: 'registration', text: 'Nouveau médecin inscrit', user: 'Dr. Ahmed Benali', time: '5 min', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, type: 'subscription', text: 'Abonnement acheté', user: 'Dr. Sarah Johnson', time: '15 min', icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 3, type: 'complaint', text: 'Plainte reçue', user: 'Dr. Omar Khalil', time: '30 min', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 4, type: 'suspension', text: 'Compte suspendu', user: 'Secrétaire Marie Dupont', time: '1h', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 5, type: 'verification', text: 'Vérification approuvée', user: 'Dr. Fatima Zahra', time: '2h', icon: FileCheck, color: 'text-teal-500', bg: 'bg-teal-50' },
];

export function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    adminService.getStats().then(setStats).catch(console.error);
  }, []);

  const tomorrow = new Date();
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bon retour, Admin</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(tomorrow)}
        </p>
        <p className="text-xs text-gray-400 font-medium mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard 
          label="Total utilisateurs" 
          value={stats?.total_users?.toString() || '0'} 
          trend="12%" 
          trendUp={true} 
          icon={<Users size={24} />} 
          iconBgColor="bg-blue-50" 
          iconColor="text-blue-600" 
        />
        <AdminStatCard 
          label="Total rendez-vous" 
          value={stats?.total_appointments?.toLocaleString() || '0'} 
          trend="8%" 
          trendUp={true} 
          icon={<Calendar size={24} />} 
          iconBgColor="bg-indigo-50" 
          iconColor="text-indigo-600" 
        />
        <AdminStatCard 
          label="Revenu total" 
          value={`$${stats?.total_revenue?.toLocaleString() || '0'}`} 
          trend="15%" 
          trendUp={true} 
          icon={<DollarSign size={24} />} 
          iconBgColor="bg-emerald-50" 
          iconColor="text-emerald-600" 
        />
        <AdminStatCard 
          label="Vérifications en attente" 
          value={stats?.pending_verifications?.toString() || '0'} 
          icon={<Clock size={24} />} 
          iconBgColor="bg-orange-50" 
          iconColor="text-orange-600" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Croissance des utilisateurs</h3>
            <button className="text-sm font-bold text-[#1D9E75] hover:underline flex items-center gap-1">
              Voir détails <ArrowUpRight size={14} />
            </button>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8B5CF6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Overview Chart */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Aperçu des revenus</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1D9E75]"></div>
                <span className="text-xs font-bold text-gray-500">Revenus</span>
              </div>
            </div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                />
                <Bar dataKey="revenue" fill="#1D9E75" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-8">Activité récente</h3>
        <div className="space-y-4">
          {activity.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-5">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.bg, item.color)}>
                  <item.icon size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.text}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">{item.user}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
