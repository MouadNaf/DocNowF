import React from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import { TopNav } from '@/components/ui/TopNav';
import { useAuthStore } from '@/store/auth.store';
import { useAppStore } from '@/store/app.store';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { DoctorPlansModal } from '@/components/doctor/DoctorPlansModal';
import { Crown } from 'lucide-react';
import { usePreferencesStore } from '@/store/preferences.store';
import { t } from '@/lib/i18n';

interface DoctorLayoutProps {
    children: React.ReactNode;
}

export const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);
    const language = usePreferencesStore((s) => s.language)
    const { isPlansModalOpen, setPlansModalOpen } = useAppStore();

    const handleLogout = () => {
        logout();
        navigate(ROUTES.LOGIN, { replace: true });
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Sidebar role="doctor" onLogout={handleLogout} />
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <TopNav />
                <main className="flex-1 overflow-y-auto p-8 relative">
                    {children}
                    
                    {/* Floating Action Button */}
                    <button
                        onClick={() => setPlansModalOpen(true)}
                        className="fixed bottom-8 right-8 bg-[#1D9E75] hover:bg-[#15805d] text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 z-40 group flex items-center gap-3"
                    >
                        <Crown size={24} className="fill-white/20" />
                        <span className="font-bold hidden sm:block whitespace-nowrap overflow-hidden transition-all max-w-0 group-hover:max-w-xs group-hover:pr-2">
                            {user?.isPremium ? t(language, 'premium') : t(language, 'upgrade')}
                        </span>
                    </button>
                </main>
            </div>

            <DoctorPlansModal 
                isOpen={isPlansModalOpen} 
                onClose={() => setPlansModalOpen(false)} 
            />
        </div>
    );
};
