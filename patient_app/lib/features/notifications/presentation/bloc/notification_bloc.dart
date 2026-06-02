import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/usecases/usecase.dart';
import '../../domain/entities/notification_entity.dart';
import '../../domain/usecases/get_notifications.dart';
import '../../domain/usecases/mark_notification_read.dart';
import '../../../notifications/data/models/notification_model.dart';
import 'notification_event.dart';
import 'notification_state.dart';

class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final GetNotifications getNotificationsUseCase;
  final MarkNotificationRead markNotificationReadUseCase;
  final MarkAllNotificationsRead markAllNotificationsReadUseCase;

  NotificationBloc({
    required this.getNotificationsUseCase,
    required this.markNotificationReadUseCase,
    required this.markAllNotificationsReadUseCase,
  }) : super(const NotificationState()) {
    on<LoadNotificationsEvent>(_onLoad);
    on<MarkNotificationReadEvent>(_onMarkRead);
    on<MarkAllNotificationsReadEvent>(_onMarkAllRead);
  }

  Future<void> _onLoad(
    LoadNotificationsEvent event,
    Emitter<NotificationState> emit,
  ) async {
    emit(state.copyWith(loading: true, clearError: true));
    final result = await getNotificationsUseCase(NoParams());
    result.fold(
      (failure) => emit(state.copyWith(loading: false, error: failure.message)),
      (notifications) {
        final unread = notifications.where((n) => !n.isRead).length;
        emit(state.copyWith(
          loading: false,
          notifications: notifications,
          unreadCount: unread,
          clearError: true,
        ));
      },
    );
  }

  Future<void> _onMarkRead(
    MarkNotificationReadEvent event,
    Emitter<NotificationState> emit,
  ) async {
    await markNotificationReadUseCase.call(event.id);
    final updated = state.notifications.map((n) {
      if (n.id == event.id) return _asRead(n);
      return n;
    }).toList();
    final unread = updated.where((n) => !n.isRead).length;
    emit(state.copyWith(notifications: updated, unreadCount: unread));
  }

  Future<void> _onMarkAllRead(
    MarkAllNotificationsReadEvent event,
    Emitter<NotificationState> emit,
  ) async {
    await markAllNotificationsReadUseCase.call();
    final updated = state.notifications.map(_asRead).toList();
    emit(state.copyWith(notifications: updated, unreadCount: 0));
  }

  NotificationEntity _asRead(NotificationEntity n) => NotificationModel(
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: true,
        createdAt: n.createdAt,
        data: n.data,
      );
}
