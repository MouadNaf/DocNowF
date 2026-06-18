import { Calendar, ClipboardList, Clock, LayoutDashboard, LogOut, Settings, UserPlus, Users, Stethoscope } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/auth.store'
import { usePreferencesStore } from '@/store/preferences.store'
import { useSecretaryProfile } from '@/hooks/useSecretary'
import { t } from '@/lib/i18n'

const amber = '#1D9E75'

export function SecretarySidebar({ onLogout }: { onLogout: () => void }) {
  const language = usePreferencesStore((s) => s.language)
  const user = useAuthStore((s) => s.user)
  useSecretaryProfile()

  const nav = [
    { to: ROUTES.SECRETARY_DASHBOARD, label: t(language, 'dashboard'), icon: LayoutDashboard },
    { to: ROUTES.SECRETARY_CALENDAR, label: t(language, 'calendar'), icon: Calendar },
    { to: ROUTES.SECRETARY_WALK_IN, label: t(language, 'walkIn'), icon: UserPlus },
    { to: ROUTES.SECRETARY_APPOINTMENTS, label: t(language, 'appointments'), icon: ClipboardList },
    { to: ROUTES.SECRETARY_WAITING, label: t(language, 'waitingList'), icon: Clock },
    { to: ROUTES.SECRETARY_PATIENTS, label: t(language, 'patients'), icon: Users },
    { to: ROUTES.SECRETARY_TREATMENTS, label: 'Traitements', icon: Stethoscope },
    { to: ROUTES.SECRETARY_SETTINGS, label: t(language, 'settings'), icon: Settings },
  ]

  const initials = `${user?.firstName?.[0] ?? '?'}${user?.lastName?.[0] ?? ''}`
  const doctorName = user?.assignedDoctor?.name
  const doctorSpeciality = user?.assignedDoctor?.speciality

  return (
    <aside className="hidden md:flex w-[220px] bg-white border-r border-gray-200 flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="h-8 w-8 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className="h-full w-full">
              <defs>
                <linearGradient id="secretaryHeart" x1="12" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#35C97D" />
                  <stop offset="1" stopColor="#1D9E75" />
                </linearGradient>
              </defs>
              <path
                d="M32 62c-1.1 0-2.1-.3-3-1.1C12.8 47.8 2.2 38.4 2.2 26.8 2.2 17.2 9.8 9.6 19.2 9.6c5.1 0 9.8 2.3 12.8 6.3 3-4 7.7-6.3 12.8-6.3 9.4 0 17 7.6 17 17.2 0 11.6-10.6 21-26.8 34.1-.9.8-1.9 1.1-3 1.1z"
                fill="url(#secretaryHeart)"
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
          <p className="font-bold text-gray-900">DocNow</p>
        </div>
        {doctorName ? (
          <div className="mt-3 rounded-lg p-3 bg-[#E8F7F1]">
            <p className="text-sm font-semibold">{doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}</p>
            {doctorSpeciality && (
              <p className="text-xs text-gray-600">{doctorSpeciality}</p>
            )}
          </div>
        ) : (
          <div className="mt-3 rounded-lg p-3 bg-orange-50 border border-orange-100">
            <p className="text-xs font-medium text-orange-700">Aucun médecin assigné</p>
          </div>
        )}
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
            <p className="text-sm font-medium">{`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Secrétaire'}</p>
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
