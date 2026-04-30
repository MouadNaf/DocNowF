import 'package:equatable/equatable.dart';
import '../../domain/entities/appointment.dart';
import '../../domain/entities/time_slot.dart';

abstract class AppointmentState extends Equatable {
  final DateTime? selectedDate;
  final String? selectedTimeSlot;
  final List<TimeSlot> availableSlots;
  final bool isLoadingSlots;
  final String? slotsErrorMessage;

  const AppointmentState({
    this.selectedDate,
    this.selectedTimeSlot,
    this.availableSlots = const [],
    this.isLoadingSlots = false,
    this.slotsErrorMessage,
  });

  @override
  List<Object?> get props => [
        selectedDate,
        selectedTimeSlot,
        availableSlots,
        isLoadingSlots,
        slotsErrorMessage,
      ];
}

class AppointmentInitial extends AppointmentState {
  const AppointmentInitial() : super();
}

class AppointmentSelectionUpdated extends AppointmentState {
  const AppointmentSelectionUpdated({
    required super.selectedDate,
    required super.selectedTimeSlot,
    super.availableSlots,
    super.isLoadingSlots,
    super.slotsErrorMessage,
  });
}

class AppointmentBookingLoading extends AppointmentState {
  const AppointmentBookingLoading({
    required super.selectedDate,
    required super.selectedTimeSlot,
    super.availableSlots,
  });
}

class AppointmentBookingSuccess extends AppointmentState {
  final Appointment appointment;

  const AppointmentBookingSuccess({
    required this.appointment,
    required super.selectedDate,
    required super.selectedTimeSlot,
    super.availableSlots,
  });

  @override
  List<Object?> get props => [appointment, selectedDate, selectedTimeSlot, availableSlots];
}

class AppointmentBookingError extends AppointmentState {
  final String message;

  const AppointmentBookingError({
    required this.message,
    required super.selectedDate,
    required super.selectedTimeSlot,
    super.availableSlots,
  });

  @override
  List<Object?> get props => [message, selectedDate, selectedTimeSlot, availableSlots];
}
