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
  Search,
  ChevronDown,
  Settings
} from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils/cn';
import { Logo } from '@/components/ui/Logo';

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
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-6">
          <Logo />
          <span className="text-[10px] font-black text-[#1D9E75] uppercase tracking-[0.2em] mt-2 block pl-11">
            Admin
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold text-sm",
                isActive 
                  ? "bg-[#1D9E75] text-white shadow-lg shadow-emerald-100" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon size={20} className={cn("transition-colors")} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50 mt-auto">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100 max-w-md flex-1">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="bg-transparent border-none text-sm focus:ring-0 w-full text-gray-700 font-medium"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
              <div className="p-1 text-gray-400 hover:bg-gray-50 rounded-xl relative transition-colors border border-transparent hover:border-gray-100">
                <NotificationBell size={20} />
              </div>
              <button className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                <Settings size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-gray-900">Admin User</p>
                <p className="text-[10px] font-bold text-[#1D9E75] uppercase tracking-widest">Administrateur</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#E8F7F1] flex items-center justify-center text-[#1D9E75] font-black shadow-sm transition-transform group-hover:scale-105 border-2 border-white">
                A
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
