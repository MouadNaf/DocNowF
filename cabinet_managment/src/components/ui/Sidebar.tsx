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
          <div className="h-10 w-10 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className="h-full w-full">
              <defs>
                <linearGradient id="sidebarHeart" x1="12" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#35C97D" />
                  <stop offset="1" stopColor="#1D9E75" />
                </linearGradient>
              </defs>
              <path
                d="M32 62c-1.1 0-2.1-.3-3-1.1C12.8 47.8 2.2 38.4 2.2 26.8 2.2 17.2 9.8 9.6 19.2 9.6c5.1 0 9.8 2.3 12.8 6.3 3-4 7.7-6.3 12.8-6.3 9.4 0 17 7.6 17 17.2 0 11.6-10.6 21-26.8 34.1-.9.8-1.9 1.1-3 1.1z"
                fill="url(#sidebarHeart)"
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

