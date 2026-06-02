import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';

// Polling interval for notifications: 30 seconds
const POLLING_INTERVAL = 30000;

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useLatestNotifications(limit: number = 5) {
  return useQuery({
    queryKey: ['notifications', 'latest', limit],
    queryFn: () => notificationService.getNotifications({ limit }),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useNotificationsList(params: { page: number; unread?: boolean; read?: boolean }) {
  return useQuery({
    queryKey: ['notifications', 'list', params],
    queryFn: () => notificationService.getNotifications(params),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      // Invalidate to refresh count and lists
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
