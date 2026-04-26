import 'package:equatable/equatable.dart';
import '../../domain/entities/appointment.dart';

abstract class AppointmentState extends Equatable {
  final DateTime? selectedDate;
  final String? selectedTimeSlot;

  const AppointmentState({
    this.selectedDate,
    this.selectedTimeSlot,
  });

  @override
  List<Object?> get props => [selectedDate, selectedTimeSlot];
}

class AppointmentInitial extends AppointmentState {
  const AppointmentInitial() : super();
}

class AppointmentSelectionUpdated extends AppointmentState {
  const AppointmentSelectionUpdated({
    required DateTime? selectedDate,
    required String? selectedTimeSlot,
  }) : super(
          selectedDate: selectedDate,
          selectedTimeSlot: selectedTimeSlot,
        );
}

class AppointmentBookingLoading extends AppointmentState {
  const AppointmentBookingLoading({
    required DateTime? selectedDate,
    required String? selectedTimeSlot,
  }) : super(
          selectedDate: selectedDate,
          selectedTimeSlot: selectedTimeSlot,
        );
}

class AppointmentBookingSuccess extends AppointmentState {
  final Appointment appointment;

  const AppointmentBookingSuccess({
    required this.appointment,
    required DateTime? selectedDate,
    required String? selectedTimeSlot,
  }) : super(
          selectedDate: selectedDate,
          selectedTimeSlot: selectedTimeSlot,
        );

  @override
  List<Object?> get props => [appointment, selectedDate, selectedTimeSlot];
}

class AppointmentBookingError extends AppointmentState {
  final String message;

  const AppointmentBookingError({
    required this.message,
    required DateTime? selectedDate,
    required String? selectedTimeSlot,
  }) : super(
          selectedDate: selectedDate,
          selectedTimeSlot: selectedTimeSlot,
        );

  @override
  List<Object?> get props => [message, selectedDate, selectedTimeSlot];
}
