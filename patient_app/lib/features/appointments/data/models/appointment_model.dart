import '../../domain/entities/appointment.dart';

class AppointmentModel extends Appointment {
  const AppointmentModel({
    required super.id,
    required super.doctorId,
    required super.patientId,
    required super.date,
    required super.timeSlot,
    required super.status,
  });

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    return AppointmentModel(
      id: json['id'],
      doctorId: json['doctor_id'],
      patientId: json['patient_id'],
      date: DateTime.parse(json['date']),
      timeSlot: json['time_slot'],
      status: json['status'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'doctor_id': doctorId,
      'patient_id': patientId,
      'date': date.toIso8601String(),
      'time_slot': timeSlot,
      'status': status,
    };
  }
}
