import React from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import { TopNav } from '@/components/ui/TopNav';
import { useAuthStore } from '@/store/auth.store';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

interface DoctorLayoutProps {
    children: React.ReactNode;
}

export const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);

    const handleLogout = () => {
        logout();
        navigate(ROUTES.LOGIN, { replace: true });
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Sidebar role="doctor" onLogout={handleLogout} />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <TopNav />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};
