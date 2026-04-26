import 'package:equatable/equatable.dart';

abstract class AppointmentEvent extends Equatable {
  const AppointmentEvent();

  @override
  List<Object> get props => [];
}

class SelectDateEvent extends AppointmentEvent {
  final DateTime date;

  const SelectDateEvent(this.date);

  @override
  List<Object> get props => [date];
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

  const SubmitAppointmentEvent({
    required this.doctorId,
    required this.date,
    required this.timeSlot,
  });

  @override
  List<Object> get props => [doctorId, date, timeSlot];
}
