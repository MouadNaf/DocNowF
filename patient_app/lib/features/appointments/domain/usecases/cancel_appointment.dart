import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/appointment_repository.dart';

class CancelAppointment implements UseCase<void, CancelAppointmentParams> {
  final AppointmentRepository repository;

  CancelAppointment(this.repository);

  @override
  Future<Either<Failure, void>> call(CancelAppointmentParams params) {
    return repository.cancelAppointment(params.appointmentId);
  }
}

class CancelAppointmentParams {
  final String appointmentId;

  CancelAppointmentParams({required this.appointmentId});
}
