import 'package:equatable/equatable.dart';
import '../../domain/entities/notification_entity.dart';

class NotificationState extends Equatable {
  final bool loading;
  final List<NotificationEntity> notifications;
  final int unreadCount;
  final String? error;

  const NotificationState({
    this.loading = false,
    this.notifications = const [],
    this.unreadCount = 0,
    this.error,
  });

  NotificationState copyWith({
    bool? loading,
    List<NotificationEntity>? notifications,
    int? unreadCount,
    String? error,
    bool clearError = false,
  }) {
    return NotificationState(
      loading: loading ?? this.loading,
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
      error: clearError ? null : (error ?? this.error),
    );
  }

  @override
  List<Object?> get props => [loading, notifications, unreadCount, error];
}
