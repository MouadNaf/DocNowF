import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/notification_repository.dart';

class MarkNotificationRead {
  final NotificationRepository repository;
  MarkNotificationRead(this.repository);

  Future<Either<Failure, void>> call(int id) => repository.markAsRead(id);
}

class MarkAllNotificationsRead {
  final NotificationRepository repository;
  MarkAllNotificationsRead(this.repository);

  Future<Either<Failure, void>> call() => repository.markAllAsRead();
}
