import api from '../lib/api';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  data: any;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  data: Notification[];
  current_page: number;
  last_page: number;
  total: number;
}

export const notificationService = {
  getNotifications: async (params?: { page?: number; per_page?: number; unread?: boolean; read?: boolean; limit?: number }) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  },

  markAsRead: async (id: number) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id: number) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};
