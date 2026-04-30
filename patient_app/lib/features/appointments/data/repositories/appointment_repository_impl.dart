import 'dart:convert';
import 'package:dartz/dartz.dart';
import 'package:patient_app/features/appointments/domain/entities/time_slot.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/api_client.dart';
import '../../domain/entities/appointment.dart';
import '../../domain/repositories/appointment_repository.dart';
import '../models/appointment_model.dart';
import 'package:intl/intl.dart';

class AppointmentRepositoryImpl implements AppointmentRepository {
  final ApiClient apiClient;

  AppointmentRepositoryImpl({required this.apiClient});

  @override
  Future<Either<Failure, Appointment>> bookAppointment({
    required String doctorId,
    required DateTime date,
    required String timeSlot,
    required String cabinetType,
    required String cabinetId,
  }) async {
    try {
      final response = await apiClient.post(
        '/appointments',
        body: {
          'doctor_id': doctorId,
          'appointment_date': DateFormat('yyyy-MM-dd').format(date),
          // Convert "10:00 AM" back to "10:00" for backend
          'start_time': DateFormat(
            'HH:mm',
          ).format(DateFormat('hh:mm a').parse(timeSlot)),
          'cabinet_type': cabinetType,
          'cabinet_id': int.parse(cabinetId),
        },
      );

      // Actually we will wait on full booking implementation since we don't have cabinetId in the event yet.
      // For now, let's just mock it or implement it correctly if we can.
      // Wait, let's fix it by adding cabinet_type and cabinet_id to the BookAppointment event...
      // Let's just keep the simulated delay for booking if the prompt mostly focused on slots, but the user said "also update ui for be compatibel with backend". Let's do it properly.

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return Right(AppointmentModel.fromJson(data));
      } else {
        final data = json.decode(response.body);
        return Left(
          ServerFailure(data['message'] ?? 'Failed to book appointment'),
        );
      }
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<TimeSlot>>> getAvailableSlots(
    String doctorId,
    DateTime date,
    String cabinetType,
    String cabinetId,
  ) async {
    try {
      final formattedDate = DateFormat('yyyy-MM-dd').format(date);
      final response = await apiClient.get(
        '/appointments/slots/$doctorId/$formattedDate/$cabinetType/$cabinetId',
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> slotsData = data['data']['slots'] ?? [];

        final List<TimeSlot> availableSlots = slotsData.map((slot) {
          final startTime = slot['start'] as String;
          final dateTime = DateFormat('HH:mm').parse(startTime);
          final isAvailable = slot['is_available'] as bool? ?? true;
          return TimeSlot(
            time: DateFormat('hh:mm a').format(dateTime),
            isAvailable: isAvailable,
          );
        }).toList();

        return Right(availableSlots);
      } else {
        return const Left(ServerFailure('Failed to fetch available slots'));
      }
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
