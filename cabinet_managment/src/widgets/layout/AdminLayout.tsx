import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Receipt, 
  AlertCircle, 
  Activity,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Settings
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils/cn';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const menuItems = [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: ROUTES.ADMIN_DASHBOARD },
    { label: 'Utilisateurs', icon: Users, path: ROUTES.ADMIN_USERS },
    { label: 'Recharges Portefeuille', icon: Wallet, path: ROUTES.ADMIN_WALLET },
    { label: 'Paiements', icon: Receipt, path: '/admin/payments' },
    { label: 'Plaintes', icon: AlertCircle, path: '/admin/complaints' },
    { label: 'Activité', icon: Activity, path: '/admin/activity' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className="h-full w-full">
                <defs>
                  <linearGradient id="adminHeart" x1="12" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#35C97D" />
                    <stop offset="1" stopColor="#1D9E75" />
                  </linearGradient>
                </defs>
                <path
                  d="M32 62c-1.1 0-2.1-.3-3-1.1C12.8 47.8 2.2 38.4 2.2 26.8 2.2 17.2 9.8 9.6 19.2 9.6c5.1 0 9.8 2.3 12.8 6.3 3-4 7.7-6.3 12.8-6.3 9.4 0 17 7.6 17 17.2 0 11.6-10.6 21-26.8 34.1-.9.8-1.9 1.1-3 1.1z"
                  fill="url(#adminHeart)"
                />
                <path
                  d="M8 34h13l3.6-8.2 5.3 15.4 4.5-10.2h21"
                  stroke="#F4FFF7"
                  strokeWidth="3.9"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">DocNow</h1>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Administrateur</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                isActive 
                  ? "bg-[#F0FDF4] text-[#1D9E75] shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon size={20} className={cn("transition-colors", "group-hover:text-[#1D9E75]")} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50 mt-auto">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium border border-transparent hover:border-red-100"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 max-w-md flex-1">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher sur la plateforme..." 
              className="bg-transparent border-none text-sm focus:ring-0 w-full text-gray-700"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
              <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg relative transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
                <Settings size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">Admin User</p>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight">Administrateur</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#0EA5E9] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-sky-100 transition-transform group-hover:scale-105">
                AU
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
