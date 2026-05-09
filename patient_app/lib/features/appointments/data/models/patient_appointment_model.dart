import '../../domain/entities/patient_appointment.dart';

class PatientAppointmentModel extends PatientAppointment {
  const PatientAppointmentModel({
    required super.id,
    required super.doctorName,
    required super.doctorSpecialty,
    required super.doctorImageUrl,
    required super.appointmentDate,
    required super.startTime,
    required super.status,
    required super.locationLabel,
  });

  factory PatientAppointmentModel.fromJson(Map<String, dynamic> json) {
    final doctor = (json['doctor'] as Map<String, dynamic>?) ?? {};
    final doctorUser = (doctor['user'] as Map<String, dynamic>?) ?? {};
    final doctorName = (doctorUser['name'] ?? 'Doctor').toString();
    final doctorSpecialty = (doctor['speciality'] ?? 'Specialist').toString();
    final doctorImage = doctorUser['profile_picture']?.toString();

    final appointmentDateRaw = (json['appointment_date'] ?? '').toString();
    final appointmentDate = DateTime.tryParse(appointmentDateRaw) ?? DateTime.now();
    final startTime = (json['start_time'] ?? '').toString();

    final privateCabinetId = json['private_cabinet_id'];
    final clinicId = json['clinic_id'];
    final collectiveCabinetId = json['collective_cabinet_id'];
    final locationLabel = privateCabinetId != null
        ? 'Private Cabinet'
        : clinicId != null
            ? 'Clinic'
            : collectiveCabinetId != null
                ? 'Collective Cabinet'
                : 'Medical Appointment';

    return PatientAppointmentModel(
      id: json['id'].toString(),
      doctorName: doctorName,
      doctorSpecialty: doctorSpecialty,
      doctorImageUrl: doctorImage,
      appointmentDate: appointmentDate,
      startTime: startTime,
      status: (json['status'] ?? 'confirmed').toString(),
      locationLabel: locationLabel,
    );
  }
}
