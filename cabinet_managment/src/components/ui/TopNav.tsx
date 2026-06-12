import { useState, useRef, useEffect } from 'react';
import { Languages, Moon, Sun, LogOut, User, ChevronDown } from 'lucide-react';
import { NotificationBell } from '../notifications/NotificationBell';
import { usePreferencesStore } from '@/store/preferences.store';
import { useAuthStore } from '@/store/auth.store';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { t } from '@/lib/i18n';
import { useWallet } from '@/shared/api/hooks';
import { Wallet } from 'lucide-react';

export function TopNav() {
  const { language, theme, toggleLanguage, toggleTheme } = usePreferencesStore();
  const navigate = useNavigate();
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-DZ' : 'en-US';
  const formattedDate = today.toLocaleDateString(locale, dateOptions);
  const welcome = t(language, 'welcomeDoctor');
  const role = t(language, 'doctor');
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data: wallet } = useWallet();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute real name & initials
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Doctor';
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'DR';

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 border-l border-gray-100 pl-6 cursor-pointer dark:border-slate-700 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1D9E75] to-emerald-400 text-sm font-bold text-white shadow-md ring-2 ring-white dark:ring-slate-800 transition-transform group-hover:scale-105">
              {initials}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900 leading-none dark:text-slate-100">
                Dr. {fullName}
              </p>
              <p className="text-xs font-semibold text-gray-400 mt-1 dark:text-slate-400">{role}</p>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50 overflow-hidden animate-fade-in-down">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-900/20">
                <p className="text-xs text-gray-500 dark:text-slate-400">Connecté en tant que</p>
                <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">Dr. {fullName}</p>
                <p className="text-xs text-[#1D9E75] truncate">{user?.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/doctor/profile');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <User size={16} className="text-gray-400" />
                  Mon profil
                </button>

                <div className="my-1 h-px bg-gray-100 dark:bg-slate-700" />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
