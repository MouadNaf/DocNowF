import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Coins,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  CalendarDays,
  List
} from 'lucide-react'

export function Sidebar({ role, onLogout }: { role: string; onLogout: () => void }) {
  const sidebarItems = [
    { path: '/doctor/dashboard', label: 'Dashboard', Icon: LayoutDashboard, role: ['doctor'] },
    { path: '/doctor/appointments', label: 'Appointments', Icon: CalendarDays, role: ['doctor'] },
    { path: '/doctor/schedule', label: 'Schedule', Icon: Calendar, role: ['doctor'] },
    { path: '/doctor/patients', label: 'Patients', Icon: Users, role: ['doctor'] },
    { path: '/doctor/accounting', label: 'Accounting', Icon: Coins, role: ['doctor'] },
    { path: '/doctor/statistics', label: 'Statistics', Icon: BarChart3, role: ['doctor'] },
    { path: '/doctor/secretaries', label: 'My Secretaries', Icon: UserCog, role: ['doctor'] },
    { path: '/doctor/settings', label: 'Settings', Icon: Settings, role: ['doctor'] },

    // ── Secretary ────────────────────────────────────────────────────────
    { path: '/secretary/calendar',      label: 'Calendrier',      Icon: Calendar,    role: ['secretary'] },
    { path: '/secretary/appointments',   label: 'Rendez-vous',     Icon: CalendarDays, role: ['secretary'] },
    { path: '/secretary/waiting-list',   label: "Liste d'attente", Icon: List,         role: ['secretary'] },
    // ── Clinic ──────────────────────────────────────────────────────────
    { path: '/clinic-admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard, role: ['clinic_admin'] },
  ];

  const userItems = useMemo(() =>
    sidebarItems.filter(item => item.role.includes(role)), [role]
  );

  return (
    <aside className='flex h-screen w-64 flex-col border-r border-gray-100 bg-white shadow-sm'>
      <div className="p-6 pb-4 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 rounded-xl p-2 text-white">
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 leading-tight">Takwit Health</h1>
            <span className="text-sm font-medium text-gray-400 capitalize">{role}</span>
          </div>
        </div>
      </div>
      <nav className="mt-8 space-y-1 p-4">
        {userItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-50!"
            style={({ isActive }) => ({
              color: isActive ? '#3b82f6' : '#6b7280',
              backgroundColor: isActive ? '#eff6ff' : 'transparent',
              fontWeight: isActive ? 600 : 500,
            })}
          >
            <Icon size={20} strokeWidth={2.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-gray-100 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-600 transition-colors hover:bg-red-50 cursor-pointer font-medium"
        >
          <LogOut size={20} strokeWidth={2.5} />
          Logout
        </button>
      </div>
    </aside>
  );
}
