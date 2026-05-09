import 'package:equatable/equatable.dart';

abstract class PatientAppointmentsEvent extends Equatable {
  const PatientAppointmentsEvent();

  @override
  List<Object?> get props => [];
}

class LoadPatientAppointmentsEvent extends PatientAppointmentsEvent {
  const LoadPatientAppointmentsEvent();
}

class ChangeAppointmentsTabEvent extends PatientAppointmentsEvent {
  final bool showUpcoming;

  const ChangeAppointmentsTabEvent({required this.showUpcoming});

  @override
  List<Object?> get props => [showUpcoming];
}

class CancelPatientAppointmentEvent extends PatientAppointmentsEvent {
  final String appointmentId;

  const CancelPatientAppointmentEvent({required this.appointmentId});

  @override
  List<Object?> get props => [appointmentId];
}
