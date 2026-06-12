import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { Languages } from 'lucide-react';
import { usePreferencesStore } from '@/store/preferences.store';
import { t } from '@/lib/i18n';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { language, toggleLanguage } = usePreferencesStore();
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 sm:px-12 bg-white/80 backdrop-blur-lg border-b border-gray-100 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <Link to={ROUTES.LANDING} className="text-sm font-bold text-gray-600 hover:text-[#1D9E75] transition-colors">{t(language, 'home')}</Link>
            <Link to={ROUTES.DOCTORS} className="text-sm font-bold text-gray-600 hover:text-[#1D9E75] transition-colors">{t(language, 'doctors_nav')}</Link>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-[#1D9E75] transition-colors bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100"
              title={t(language, 'changeLanguage')}
            >
              <Languages size={16} />
              <span className="uppercase">{language}</span>
            </button>
            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost" className="font-bold">{t(language, 'login_btn')}</Button>
            </Link>
            <Link to={ROUTES.ROLE_PICKER}>
              <Button className="bg-[#1D9E75] hover:bg-[#15805d] rounded-full px-6 font-bold text-white shadow-lg shadow-emerald-100">
                {t(language, 'register_btn')}
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
