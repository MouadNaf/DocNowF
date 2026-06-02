import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Notification } from '../../services/notificationService';

interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${!notification.is_read ? 'bg-[#F2F9F7]' : 'bg-white'}`}
    >
      <div className="flex gap-3">
        {/* Unread indicator */}
        <div className="mt-1.5 flex-shrink-0">
          {!notification.is_read ? (
            <div className="w-2 h-2 rounded-full bg-[#1D9E75]"></div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-transparent"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
            {notification.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-[10px] text-gray-400 mt-1 font-medium">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
          </p>
        </div>
      </div>
    </div>
  );
};
