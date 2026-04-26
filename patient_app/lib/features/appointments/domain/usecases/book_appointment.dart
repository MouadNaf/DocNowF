import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/appointment.dart';
import '../repositories/appointment_repository.dart';

class BookAppointment {
  final AppointmentRepository repository;

  BookAppointment(this.repository);

  Future<Either<Failure, Appointment>> call(BookAppointmentParams params) async {
    return await repository.bookAppointment(
      doctorId: params.doctorId,
      date: params.date,
      timeSlot: params.timeSlot,
    );
  }
}

class BookAppointmentParams {
  final String doctorId;
  final DateTime date;
  final String timeSlot;

  BookAppointmentParams({
    required this.doctorId,
    required this.date,
    required this.timeSlot,
  });
}
