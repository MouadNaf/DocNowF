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
    final dateRaw = (json['appointment_date'] ?? json['date'] ?? '').toString();
    final timeRaw = (json['start_time'] ?? json['time_slot'] ?? '').toString();

    return AppointmentModel(
      id: json['id'].toString(),
      doctorId: json['doctor_id'].toString(),
      patientId: json['patient_id'].toString(),
      date: DateTime.tryParse(dateRaw) ?? DateTime.now(),
      timeSlot: timeRaw,
      status: (json['status'] ?? 'confirmed').toString(),
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
