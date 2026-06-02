import { Languages, LogOut, Moon, Sun, UserPlus } from 'lucide-react'
import { NotificationBell } from '../notifications/NotificationBell'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { usePreferencesStore } from '@/store/preferences.store'
import { useAuthStore } from '@/store/auth.store'
import { t } from '@/lib/i18n'

export function SecretaryTopbar({ title }: { title: string }) {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const { language, theme, toggleLanguage, toggleTheme } = usePreferencesStore()
  const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-DZ' : 'en-US'
  const formattedDate = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return (
    <header className="bg-white border-b h-16 px-6 flex items-center justify-between dark:bg-slate-900 dark:border-slate-700">
      <div>
        <h1 className="text-lg font-semibold dark:text-slate-100">{title}</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400">{formattedDate}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="size-10 border rounded-lg flex items-center justify-center dark:border-slate-600 dark:text-slate-200"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={toggleLanguage}
          className="h-10 px-2 border rounded-lg text-xs font-semibold flex items-center gap-1 dark:border-slate-600 dark:text-slate-200"
          title="Switch language"
        >
          <Languages size={14} />
          {language === 'fr' ? 'FR' : language === 'en' ? 'EN' : 'AR'}
        </button>
        <button
          onClick={() => navigate(ROUTES.SECRETARY_WALK_IN)}
          className="h-10 px-4 rounded-lg text-white bg-[#1D9E75] flex items-center gap-2 text-sm"
        >
          <UserPlus size={16} /> {t(language, 'walkIn')}
        </button>
        <div className="flex items-center justify-center dark:text-slate-200">
          <NotificationBell size={20} />
        </div>
      </div>
    </header>
  )
}

