import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/time_slot.dart';
import '../repositories/appointment_repository.dart';

class GetAvailableSlots {
  final AppointmentRepository repository;

  GetAvailableSlots(this.repository);

  Future<Either<Failure, List<TimeSlot>>> call(GetAvailableSlotsParams params) async {
    return await repository.getAvailableSlots(
      params.doctorId,
      params.date,
      params.cabinetType,
      params.cabinetId,
    );
  }
}

class GetAvailableSlotsParams {
  final String doctorId;
  final DateTime date;
  final String cabinetType;
  final String cabinetId;

  GetAvailableSlotsParams({
    required this.doctorId,
    required this.date,
    required this.cabinetType,
    required this.cabinetId,
  });
}
