import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/appointment.dart';

abstract class AppointmentRepository {
  Future<Either<Failure, Appointment>> bookAppointment({
    required String doctorId,
    required DateTime date,
    required String timeSlot,
  });
}
