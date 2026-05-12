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
  List,
  User
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/auth.store'
import { usePreferencesStore } from '@/store/preferences.store'
import { t } from '@/lib/i18n'

export function Sidebar({ role, onLogout }: { role: string; onLogout: () => void }) {
  const user = useAuthStore((s) => s.user)
  const language = usePreferencesStore((s) => s.language)
  
  const sidebarItems = [
    { path: ROUTES.DOCTOR_DASHBOARD, label: t(language, 'dashboard'), Icon: LayoutDashboard, role: ['doctor'] },
    { path: ROUTES.DOCTOR_APPOINTMENTS, label: t(language, 'appointments'), Icon: CalendarDays, role: ['doctor'] },
    { path: ROUTES.DOCTOR_SCHEDULE, label: t(language, 'schedule'), Icon: Calendar, role: ['doctor'] },
    { path: ROUTES.DOCTOR_PATIENTS, label: t(language, 'patients'), Icon: Users, role: ['doctor'] },
    { path: ROUTES.DOCTOR_ACCOUNTING, label: t(language, 'accounting'), Icon: Coins, role: ['doctor'] },
    { path: ROUTES.DOCTOR_STATISTICS, label: t(language, 'statistics'), Icon: BarChart3, role: ['doctor'] },
    { path: ROUTES.DOCTOR_SECRETARIES, label: t(language, 'secretaries'), Icon: UserCog, role: ['doctor'] },
    { path: ROUTES.DOCTOR_SETTINGS, label: t(language, 'settings'), Icon: Settings, role: ['doctor'] },
    { path: ROUTES.DOCTOR_PROFILE, label: t(language, 'profile'), Icon: User, role: ['doctor'] },
    { path: '/secretary/calendar', label: t(language, 'calendar'), Icon: Calendar, role: ['secretary'] },
    { path: '/secretary/appointments', label: t(language, 'appointments'), Icon: CalendarDays, role: ['secretary'] },
    { path: '/secretary/waiting-list', label: t(language, 'waitingList'), Icon: List, role: ['secretary'] },
    { path: '/clinic-admin/dashboard', label: t(language, 'dashboard'), Icon: LayoutDashboard, role: ['clinic_admin'] },
  ]

  const userItems = useMemo(() => {
    const items = sidebarItems.filter(item => item.role.includes(role));
    
    // For doctors, filter based on cabinet status
    if (role === 'doctor') {
      const hasCabinet = user?.doctorType === 'private_cabinet';
      
      if (!hasCabinet) {
        return items.filter(item => item.path === ROUTES.DOCTOR_PROFILE || item.path === ROUTES.DOCTOR_DASHBOARD);
      }
    }
    
    return items;
  }, [role, user?.doctorType, sidebarItems]);

  return (
    <aside className='flex h-screen w-64 flex-col border-r border-gray-100 bg-white shadow-sm'>
      <div className="p-6 pb-4 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 rounded-xl p-2 text-white">
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 leading-tight">DocNow</h1>
            <span className="text-sm font-medium text-gray-400 capitalize">{role === 'doctor' ? t(language, 'doctor') : role === 'secretary' ? t(language, 'secretary') : role}</span>
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
              color: isActive ? '#1D9E75' : '#6b7280',
              backgroundColor: isActive ? '#E8F7F1' : 'transparent',
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
          {t(language, 'logout')}
        </button>
      </div>
    </aside>
  )
}

