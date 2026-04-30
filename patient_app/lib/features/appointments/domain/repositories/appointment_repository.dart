import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/appointment.dart';
import '../entities/time_slot.dart';

abstract class AppointmentRepository {
  Future<Either<Failure, Appointment>> bookAppointment({
    required String doctorId,
    required DateTime date,
    required String timeSlot,
    required String cabinetType,
    required String cabinetId,
  });

  Future<Either<Failure, List<TimeSlot>>> getAvailableSlots(
    String doctorId,
    DateTime date,
    String cabinetType,
    String cabinetId,
  );
}
