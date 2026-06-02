import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationItem } from './NotificationItem';
import { useLatestNotifications, useMarkNotificationAsRead } from '../../hooks/useNotifications';
import type { Notification } from '../../services/notificationService';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { data: notifications, isLoading, isError } = useLatestNotifications(5);
  const markAsRead = useMarkNotificationAsRead();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    // Could navigate somewhere specific based on notification.type here
    onClose();
  };

  const handleViewAll = () => {
    navigate('/notifications');
    onClose();
  };

  return (
    <div className="w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[400px]">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-400">Chargement...</div>
        ) : isError ? (
          <div className="p-4 text-center text-sm text-red-400">Erreur de chargement</div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">Aucune notification</div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notif: Notification) => (
              <NotificationItem 
                key={notif.id} 
                notification={notif} 
                onClick={handleNotificationClick} 
              />
            ))}
          </div>
        )}
      </div>

      <div 
        onClick={handleViewAll}
        className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <span className="text-xs font-semibold text-[#1D9E75]">Voir toutes les notifications</span>
      </div>
    </div>
  );
};
