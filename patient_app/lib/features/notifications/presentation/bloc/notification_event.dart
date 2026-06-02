import 'package:equatable/equatable.dart';

abstract class NotificationEvent extends Equatable {
  const NotificationEvent();
  @override
  List<Object?> get props => [];
}

class LoadNotificationsEvent extends NotificationEvent {
  const LoadNotificationsEvent();
}

class MarkNotificationReadEvent extends NotificationEvent {
  final int id;
  const MarkNotificationReadEvent(this.id);
  @override
  List<Object?> get props => [id];
}

class MarkAllNotificationsReadEvent extends NotificationEvent {
  const MarkAllNotificationsReadEvent();
}
