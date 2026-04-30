import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/book_appointment.dart';
import '../../domain/usecases/get_available_slots.dart';
import 'appointment_event.dart';
import 'appointment_state.dart';

class AppointmentBloc extends Bloc<AppointmentEvent, AppointmentState> {
  final BookAppointment bookAppointmentUseCase;
  final GetAvailableSlots getAvailableSlotsUseCase;

  AppointmentBloc({
    required this.bookAppointmentUseCase,
    required this.getAvailableSlotsUseCase,
  }) : super(const AppointmentInitial()) {
    on<SelectDateEvent>(_onSelectDate);
    on<SelectTimeSlotEvent>(_onSelectTimeSlot);
    on<SubmitAppointmentEvent>(_onSubmitAppointment);
  }

  Future<void> _onSelectDate(SelectDateEvent event, Emitter<AppointmentState> emit) async {
    // First, emit loading state for slots
    emit(AppointmentSelectionUpdated(
      selectedDate: event.date,
      selectedTimeSlot: null, // Reset time slot when date changes
      isLoadingSlots: true,
      availableSlots: const [],
      slotsErrorMessage: null,
    ));

    final result = await getAvailableSlotsUseCase(
      GetAvailableSlotsParams(
        doctorId: event.doctorId,
        date: event.date,
        cabinetType: event.cabinetType,
        cabinetId: event.cabinetId,
      ),
    );

    result.fold(
      (failure) {
        emit(AppointmentSelectionUpdated(
          selectedDate: event.date,
          selectedTimeSlot: null,
          isLoadingSlots: false,
          availableSlots: const [],
          slotsErrorMessage: failure.message,
        ));
      },
      (slots) {
        emit(AppointmentSelectionUpdated(
          selectedDate: event.date,
          selectedTimeSlot: null,
          isLoadingSlots: false,
          availableSlots: slots,
          slotsErrorMessage: null,
        ));
      },
    );
  }

  void _onSelectTimeSlot(SelectTimeSlotEvent event, Emitter<AppointmentState> emit) {
    emit(AppointmentSelectionUpdated(
      selectedDate: state.selectedDate,
      selectedTimeSlot: event.timeSlot,
      availableSlots: state.availableSlots,
      isLoadingSlots: state.isLoadingSlots,
      slotsErrorMessage: state.slotsErrorMessage,
    ));
  }

  Future<void> _onSubmitAppointment(SubmitAppointmentEvent event, Emitter<AppointmentState> emit) async {
    emit(AppointmentBookingLoading(
      selectedDate: state.selectedDate,
      selectedTimeSlot: state.selectedTimeSlot,
      availableSlots: state.availableSlots,
    ));

    final result = await bookAppointmentUseCase(
      BookAppointmentParams(
        doctorId: event.doctorId,
        date: event.date,
        timeSlot: event.timeSlot,
        cabinetType: event.cabinetType,
        cabinetId: event.cabinetId,
      ),
    );

    result.fold(
      (failure) => emit(AppointmentBookingError(
        message: failure.message,
        selectedDate: state.selectedDate,
        selectedTimeSlot: state.selectedTimeSlot,
        availableSlots: state.availableSlots,
      )),
      (appointment) => emit(AppointmentBookingSuccess(
        appointment: appointment,
        selectedDate: state.selectedDate,
        selectedTimeSlot: state.selectedTimeSlot,
        availableSlots: state.availableSlots,
      )),
    );
  }
}
