import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/appointment.dart';
import '../../domain/repositories/appointment_repository.dart';
import '../models/appointment_model.dart';

class AppointmentRepositoryImpl implements AppointmentRepository {
  @override
  Future<Either<Failure, Appointment>> bookAppointment({
    required String doctorId,
    required DateTime date,
    required String timeSlot,
  }) async {
    try {
      // Simulate network delay
      await Future.delayed(const Duration(seconds: 1));

      // Mock successful booking
      final appointment = AppointmentModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        doctorId: doctorId,
        patientId: 'patient_123', // Hardcoded for now
        date: date,
        timeSlot: timeSlot,
        status: 'confirmed',
      );

      return Right(appointment);
    } catch (e) {
      return const Left(ServerFailure('Failed to book appointment'));
    }
  }
}
