import React, { useState } from 'react';
import { List, Pagination, Radio, Button, Popconfirm, message } from 'antd';
import { Trash2, CheckCircle } from 'lucide-react';
import { SecretaryLayout } from '../../components/layout/SecretaryLayout'; // Update this depending on role, or use a generic wrapper
import { NotificationItem } from '../../components/notifications/NotificationItem';
import { 
  useNotificationsList, 
  useMarkAllNotificationsAsRead, 
  useDeleteNotification,
  useMarkNotificationAsRead
} from '../../hooks/useNotifications';
import type { Notification } from '../../services/notificationService';

export const NotificationsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  const { data, isLoading, isError } = useNotificationsList({
    page,
    unread: filter === 'unread' ? true : undefined,
    read: filter === 'read' ? true : undefined
  });

  const markAllAsRead = useMarkAllNotificationsAsRead();
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotif = useDeleteNotification();

  const handleMarkAll = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => message.success('Toutes les notifications ont été marquées comme lues')
    });
  };

  const handleDelete = (id: number) => {
    deleteNotif.mutate(id, {
      onSuccess: () => message.success('Notification supprimée')
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
  };

  // We are assuming a standalone page layout, you might want to wrap this in your 
  // role-specific layout like <AdminLayout>, <SecretaryLayout>, etc. 
  // For now, providing a generic container
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez toutes vos alertes et notifications système</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            type="default" 
            icon={<CheckCircle size={16} />} 
            onClick={handleMarkAll}
            loading={markAllAsRead.isPending}
            className="flex items-center"
          >
            Tout marquer comme lu
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <Radio.Group 
            value={filter} 
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1); // Reset page on filter change
            }}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="all">Toutes</Radio.Button>
            <Radio.Button value="unread">Non lues</Radio.Button>
            <Radio.Button value="read">Lues</Radio.Button>
          </Radio.Group>
        </div>

        <div className="min-h-[400px]">
          <List
            loading={isLoading}
            dataSource={data?.data || []}
            renderItem={(item: Notification) => (
              <div className="relative group">
                <NotificationItem notification={item} onClick={handleNotificationClick} />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Popconfirm
                    title="Supprimer cette notification ?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Oui"
                    cancelText="Non"
                    placement="left"
                  >
                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </Popconfirm>
                </div>
              </div>
            )}
            locale={{ emptyText: isError ? 'Erreur de chargement des notifications' : 'Aucune notification trouvée' }}
          />
        </div>

        {data && data.total > 0 && (
          <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
            <Pagination
              current={page}
              pageSize={10}
              total={data.total}
              onChange={(newPage) => setPage(newPage)}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
