import 'package:equatable/equatable.dart';

class PatientAppointment extends Equatable {
  final String id;
  final String doctorName;
  final String doctorSpecialty;
  final String? doctorImageUrl;
  final DateTime appointmentDate;
  final String startTime;
  final String status;
  final String locationLabel;

  const PatientAppointment({
    required this.id,
    required this.doctorName,
    required this.doctorSpecialty,
    required this.doctorImageUrl,
    required this.appointmentDate,
    required this.startTime,
    required this.status,
    required this.locationLabel,
  });

  @override
  List<Object?> get props => [
        id,
        doctorName,
        doctorSpecialty,
        doctorImageUrl,
        appointmentDate,
        startTime,
        status,
        locationLabel,
      ];
}
