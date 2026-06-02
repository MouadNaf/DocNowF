import 'dart:convert';
import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/api_client.dart';
import '../../domain/entities/notification_entity.dart';
import '../../domain/repositories/notification_repository.dart';
import '../models/notification_model.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  final ApiClient apiClient;

  NotificationRepositoryImpl({required this.apiClient});

  @override
  Future<Either<Failure, List<NotificationEntity>>> getNotifications() async {
    try {
      final response = await apiClient.get('/notifications');
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        // Backend returns paginated {data:[...]} OR plain list
        List<dynamic> items;
        if (decoded is Map && decoded['data'] is List) {
          items = decoded['data'] as List<dynamic>;
        } else if (decoded is List) {
          items = decoded;
        } else {
          items = [];
        }
        final notifications = items
            .whereType<Map<String, dynamic>>()
            .map(NotificationModel.fromJson)
            .toList();
        return Right(notifications);
      }
      final data = json.decode(response.body);
      return Left(ServerFailure(data['message'] ?? 'Failed to fetch notifications'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, int>> getUnreadCount() async {
    try {
      final response = await apiClient.get('/notifications/unread-count');
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return Right(data['count'] as int? ?? 0);
      }
      return const Right(0);
    } catch (e) {
      return const Right(0);
    }
  }

  @override
  Future<Either<Failure, void>> markAsRead(int id) async {
    try {
      final response = await apiClient.put('/notifications/$id/read');
      if (response.statusCode == 200) return const Right(null);
      final data = json.decode(response.body);
      return Left(ServerFailure(data['message'] ?? 'Failed to mark as read'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> markAllAsRead() async {
    try {
      final response = await apiClient.put('/notifications/read-all');
      if (response.statusCode == 200) return const Right(null);
      final data = json.decode(response.body);
      return Left(ServerFailure(data['message'] ?? 'Failed'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
