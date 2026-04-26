import 'package:equatable/equatable.dart';

class Appointment extends Equatable {
  final String id;
  final String doctorId;
  final String patientId;
  final DateTime date;
  final String timeSlot;
  final String status;

  const Appointment({
    required this.id,
    required this.doctorId,
    required this.patientId,
    required this.date,
    required this.timeSlot,
    required this.status,
  });

  @override
  List<Object?> get props => [id, doctorId, patientId, date, timeSlot, status];
}
