import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../entities/patient_appointment.dart';
import '../repositories/appointment_repository.dart';

class GetPatientAppointments implements UseCase<List<PatientAppointment>, NoParams> {
  final AppointmentRepository repository;

  GetPatientAppointments(this.repository);

  @override
  Future<Either<Failure, List<PatientAppointment>>> call(NoParams params) {
    return repository.getPatientAppointments();
  }
}
