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
  FileCheck,
  Wallet,
  Check,
  X,
  ExternalLink
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

export function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [revenueGrowth, setRevenueGrowth] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [rechargeRequests, setRechargeRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await adminService.getRechargeRequests();
      setRechargeRequests(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    adminService.getStats().then(setStats).catch(console.error);
    adminService.getUserGrowth().then(setUserGrowth).catch(console.error);
    adminService.getRevenueGrowth().then(setRevenueGrowth).catch(console.error);
    adminService.getRecentActivity().then(setRecentActivity).catch(console.error);
    fetchRequests();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await adminService.approveRecharge(id);
      fetchRequests();
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Reason for rejection:');
    if (reason === null) return;
    try {
      await adminService.rejectRecharge(id, reason);
      fetchRequests();
    } catch (err) {
      alert('Failed to reject');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'doctor': return { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'patient': return { icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-50' };
      case 'secretary': return { icon: UserPlus, color: 'text-orange-500', bg: 'bg-orange-50' };
      case 'clinic': return { icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-50' };
      default: return { icon: FileCheck, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

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
          trend={stats?.total_users > 0 ? "Real" : "0%"} 
          trendUp={true} 
          icon={<Users size={24} />} 
          iconBgColor="bg-blue-50" 
          iconColor="text-blue-600" 
        />
        <AdminStatCard 
          label="Total rendez-vous" 
          value={stats?.total_appointments?.toLocaleString() || '0'} 
          trend={stats?.total_appointments > 0 ? "Real" : "0%"} 
          trendUp={true} 
          icon={<Calendar size={24} />} 
          iconBgColor="bg-indigo-50" 
          iconColor="text-indigo-600" 
        />
        <AdminStatCard 
          label="Revenu total" 
          value={`${stats?.total_revenue?.toLocaleString() || '0'} DA`} 
          trend={stats?.total_revenue > 0 ? "Real" : "0%"} 
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
              <LineChart data={userGrowth}>
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
              <BarChart data={revenueGrowth}>
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
          {recentActivity.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Aucune activité récente</p>
          ) : (
            recentActivity.map((item) => {
              const { icon: Icon, color, bg } = getActivityIcon(item.type);
              return (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", bg, color)}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.text}</p>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">{item.user}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-400">{item.time}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
