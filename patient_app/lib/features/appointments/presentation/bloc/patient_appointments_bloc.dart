import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/usecases/usecase.dart';
import '../../domain/entities/patient_appointment.dart';
import '../../domain/usecases/cancel_appointment.dart';
import '../../domain/usecases/get_patient_appointments.dart';
import 'patient_appointments_event.dart';
import 'patient_appointments_state.dart';

class PatientAppointmentsBloc
    extends Bloc<PatientAppointmentsEvent, PatientAppointmentsState> {
  final GetPatientAppointments getPatientAppointmentsUseCase;
  final CancelAppointment cancelAppointmentUseCase;

  PatientAppointmentsBloc({
    required this.getPatientAppointmentsUseCase,
    required this.cancelAppointmentUseCase,
  }) : super(const PatientAppointmentsState(loading: true)) {
    on<LoadPatientAppointmentsEvent>(_onLoad);
    on<ChangeAppointmentsTabEvent>(_onTabChanged);
    on<CancelPatientAppointmentEvent>(_onCancel);
  }

  Future<void> _onLoad(
    LoadPatientAppointmentsEvent event,
    Emitter<PatientAppointmentsState> emit,
  ) async {
    emit(state.copyWith(loading: true, clearError: true));
    final result = await getPatientAppointmentsUseCase(NoParams());

    result.fold(
      (failure) => emit(state.copyWith(loading: false, error: failure.message)),
      (appointments) {
        final now = DateTime.now();
        final upcoming = <PatientAppointment>[];
        final past = <PatientAppointment>[];

        for (final item in appointments) {
          final isPast = item.appointmentDate.isBefore(DateTime(now.year, now.month, now.day)) ||
              item.status == 'cancelled' ||
              item.status == 'completed';
          if (isPast) {
            past.add(item);
          } else {
            upcoming.add(item);
          }
        }

        emit(state.copyWith(
          loading: false,
          upcoming: upcoming,
          past: past,
          clearError: true,
        ));
      },
    );
  }

  void _onTabChanged(
    ChangeAppointmentsTabEvent event,
    Emitter<PatientAppointmentsState> emit,
  ) {
    emit(state.copyWith(showUpcoming: event.showUpcoming));
  }

  Future<void> _onCancel(
    CancelPatientAppointmentEvent event,
    Emitter<PatientAppointmentsState> emit,
  ) async {
    final nextCancelling = Set<String>.from(state.cancellingIds)..add(event.appointmentId);
    emit(state.copyWith(cancellingIds: nextCancelling, clearError: true));

    final result = await cancelAppointmentUseCase(
      CancelAppointmentParams(appointmentId: event.appointmentId),
    );

    result.fold(
      (failure) {
        final rolledBack = Set<String>.from(state.cancellingIds)..remove(event.appointmentId);
        emit(state.copyWith(cancellingIds: rolledBack, error: failure.message));
      },
      (_) {
        add(const LoadPatientAppointmentsEvent());
      },
    );
  }
}
