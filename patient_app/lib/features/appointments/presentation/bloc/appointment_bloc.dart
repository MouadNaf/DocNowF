import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/book_appointment.dart';
import 'appointment_event.dart';
import 'appointment_state.dart';

class AppointmentBloc extends Bloc<AppointmentEvent, AppointmentState> {
  final BookAppointment bookAppointmentUseCase;

  AppointmentBloc({required this.bookAppointmentUseCase}) : super(const AppointmentInitial()) {
    on<SelectDateEvent>(_onSelectDate);
    on<SelectTimeSlotEvent>(_onSelectTimeSlot);
    on<SubmitAppointmentEvent>(_onSubmitAppointment);
  }

  void _onSelectDate(SelectDateEvent event, Emitter<AppointmentState> emit) {
    emit(AppointmentSelectionUpdated(
      selectedDate: event.date,
      selectedTimeSlot: state.selectedTimeSlot,
    ));
  }

  void _onSelectTimeSlot(SelectTimeSlotEvent event, Emitter<AppointmentState> emit) {
    emit(AppointmentSelectionUpdated(
      selectedDate: state.selectedDate,
      selectedTimeSlot: event.timeSlot,
    ));
  }

  Future<void> _onSubmitAppointment(SubmitAppointmentEvent event, Emitter<AppointmentState> emit) async {
    emit(AppointmentBookingLoading(
      selectedDate: state.selectedDate,
      selectedTimeSlot: state.selectedTimeSlot,
    ));

    final result = await bookAppointmentUseCase(
      BookAppointmentParams(
        doctorId: event.doctorId,
        date: event.date,
        timeSlot: event.timeSlot,
      ),
    );

    result.fold(
      (failure) => emit(AppointmentBookingError(
        message: failure.message,
        selectedDate: state.selectedDate,
        selectedTimeSlot: state.selectedTimeSlot,
      )),
      (appointment) => emit(AppointmentBookingSuccess(
        appointment: appointment,
        selectedDate: state.selectedDate,
        selectedTimeSlot: state.selectedTimeSlot,
      )),
    );
  }
}
