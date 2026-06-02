import { Languages, Moon, Sun } from 'lucide-react';
import { NotificationBell } from '../notifications/NotificationBell';
import { usePreferencesStore } from '@/store/preferences.store'
import { useAuthStore } from '@/store/auth.store'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { t } from '@/lib/i18n'
import { useWallet } from '@/shared/api/hooks'
import { Wallet } from 'lucide-react'

export function TopNav() {
  const { language, theme, toggleLanguage, toggleTheme } = usePreferencesStore()
  const navigate = useNavigate()
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-DZ' : 'en-US'
  const formattedDate = today.toLocaleDateString(locale, dateOptions);
  const welcome = t(language, 'welcomeDoctor')
  const role = t(language, 'doctor')
  const user = useAuthStore((s) => s.user)
  const { data: wallet } = useWallet()

  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-100 bg-white px-8 dark:border-slate-700 dark:bg-slate-900">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 leading-tight dark:text-slate-100">{welcome}</h2>
        <p className="text-sm font-medium text-gray-500 mt-1 dark:text-slate-400">{formattedDate}</p>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={toggleTheme}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={toggleLanguage}
          className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Switch language"
        >
          <Languages size={14} />
          {language === 'fr' ? 'FR' : language === 'en' ? 'EN' : 'AR'}
        </button>
        <div className="relative cursor-pointer text-gray-500 hover:text-gray-700 transition dark:text-slate-300">
          <NotificationBell size={20} />
        </div>

        {user?.role === 'doctor' && (
          <div 
            onClick={() => navigate('/doctor/accounting')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[#1D9E75] hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <Wallet size={18} />
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] uppercase font-bold opacity-70">Wallet</span>
              <span className="text-sm font-bold">{wallet?.balance ?? 0} DA</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 border-l border-gray-100 pl-6 cursor-pointer dark:border-slate-700">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
            DSJ
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none dark:text-slate-100">Dr. Sarah Johnson</p>
            <p className="text-xs font-semibold text-gray-400 mt-1 dark:text-slate-400">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
