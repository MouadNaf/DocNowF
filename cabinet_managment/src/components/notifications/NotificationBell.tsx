import React, { useState } from 'react';
import { Badge, Dropdown } from 'antd';
import { Bell } from 'lucide-react';
import { useUnreadNotificationCount } from '../../hooks/useNotifications';
import { NotificationDropdown } from './NotificationDropdown';

interface NotificationBellProps {
  color?: string; // Optional color for the bell icon
  size?: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ color = 'currentColor', size = 20 }) => {
  const [open, setOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <Dropdown
      open={open}
      onOpenChange={handleOpenChange}
      trigger={['click']}
      placement="bottomRight"
      dropdownRender={() => <NotificationDropdown onClose={() => setOpen(false)} />}
    >
      <div className="cursor-pointer flex items-center justify-center p-1 rounded-full hover:bg-gray-100 transition-colors">
        <Badge 
          count={unreadCount} 
          overflowCount={99}
          size="small"
          style={{ backgroundColor: '#EF4444' }} // Red badge as requested
        >
          <Bell size={size} color={color} />
        </Badge>
      </div>
    </Dropdown>
  );
};
