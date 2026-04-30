import 'package:equatable/equatable.dart';

abstract class AppointmentEvent extends Equatable {
  const AppointmentEvent();

  @override
  List<Object> get props => [];
}

class SelectDateEvent extends AppointmentEvent {
  final DateTime date;
  final String doctorId;
  final String cabinetType;
  final String cabinetId;

  const SelectDateEvent(
    this.date, {
    required this.doctorId,
    required this.cabinetType,
    required this.cabinetId,
  });

  @override
  List<Object> get props => [date, doctorId, cabinetType, cabinetId];
}

class SelectTimeSlotEvent extends AppointmentEvent {
  final String timeSlot;

  const SelectTimeSlotEvent(this.timeSlot);

  @override
  List<Object> get props => [timeSlot];
}

class SubmitAppointmentEvent extends AppointmentEvent {
  final String doctorId;
  final DateTime date;
  final String timeSlot;
  final String cabinetType;
  final String cabinetId;

  const SubmitAppointmentEvent({
    required this.doctorId,
    required this.date,
    required this.timeSlot,
    required this.cabinetType,
    required this.cabinetId,
  });

  @override
  List<Object> get props => [doctorId, date, timeSlot, cabinetType, cabinetId];
}
