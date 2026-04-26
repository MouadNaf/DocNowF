import { Calendar, ClipboardList, Clock, LayoutDashboard, LogOut, Settings, UserPlus, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { MOCK_SECRETARY } from '@/lib/mock/secretary.mock'
import { usePreferencesStore } from '@/store/preferences.store'
import { t } from '@/lib/i18n'

const amber = '#1D9E75'

export function SecretarySidebar({ onLogout }: { onLogout: () => void }) {
  const language = usePreferencesStore((s) => s.language)
  const nav = [
    { to: ROUTES.SECRETARY_DASHBOARD, label: t(language, 'dashboard'), icon: LayoutDashboard },
    { to: ROUTES.SECRETARY_CALENDAR, label: t(language, 'calendar'), icon: Calendar },
    { to: ROUTES.SECRETARY_WALK_IN, label: t(language, 'walkIn'), icon: UserPlus },
    { to: ROUTES.SECRETARY_APPOINTMENTS, label: t(language, 'appointments'), icon: ClipboardList },
    { to: ROUTES.SECRETARY_WAITING, label: t(language, 'waitingList'), icon: Clock },
    { to: ROUTES.SECRETARY_PATIENTS, label: t(language, 'patients'), icon: Users },
    { to: ROUTES.SECRETARY_SETTINGS, label: t(language, 'settings'), icon: Settings },
  ]
  const initials = `${MOCK_SECRETARY.firstName[0]}${MOCK_SECRETARY.lastName[0]}`
  return (
    <aside className="hidden md:flex w-[220px] bg-white border-r border-gray-200 flex-col">
      <div className="p-4 border-b border-gray-100">
        <p className="font-bold text-gray-900">Takwit Health</p>
        <div className="mt-3 rounded-lg p-3 bg-[#E8F7F1]">
          <p className="text-sm font-semibold">{`Dr. ${MOCK_SECRETARY.assignedDoctor.firstName} ${MOCK_SECRETARY.assignedDoctor.lastName}`}</p>
          <p className="text-xs text-gray-600">{MOCK_SECRETARY.assignedDoctor.specialization[0]}</p>
        </div>
      </div>
      <nav className="p-2 space-y-1 flex-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                isActive ? 'bg-[#E8F7F1] text-[#0F5132] border-l-4 border-[#1D9E75]' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon size={16} color={amber} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">{initials}</div>
          <div>
            <p className="text-sm font-medium">{`${MOCK_SECRETARY.firstName} ${MOCK_SECRETARY.lastName}`}</p>
            <p className="text-xs text-gray-500">{t(language, 'secretary')}</p>
          </div>
        </div>
        <button onClick={onLogout} className="w-full text-red-600 border border-red-200 rounded-lg px-3 py-2 text-sm flex items-center justify-center gap-2">
          <LogOut size={14} /> {t(language, 'logout')}
        </button>
      </div>
    </aside>
  )
}

