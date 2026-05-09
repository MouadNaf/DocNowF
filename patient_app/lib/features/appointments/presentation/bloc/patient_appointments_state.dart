import 'package:equatable/equatable.dart';
import '../../domain/entities/patient_appointment.dart';

class PatientAppointmentsState extends Equatable {
  final bool loading;
  final String? error;
  final bool showUpcoming;
  final List<PatientAppointment> upcoming;
  final List<PatientAppointment> past;
  final Set<String> cancellingIds;

  const PatientAppointmentsState({
    this.loading = false,
    this.error,
    this.showUpcoming = true,
    this.upcoming = const [],
    this.past = const [],
    this.cancellingIds = const {},
  });

  List<PatientAppointment> get currentItems => showUpcoming ? upcoming : past;

  PatientAppointmentsState copyWith({
    bool? loading,
    String? error,
    bool clearError = false,
    bool? showUpcoming,
    List<PatientAppointment>? upcoming,
    List<PatientAppointment>? past,
    Set<String>? cancellingIds,
  }) {
    return PatientAppointmentsState(
      loading: loading ?? this.loading,
      error: clearError ? null : (error ?? this.error),
      showUpcoming: showUpcoming ?? this.showUpcoming,
      upcoming: upcoming ?? this.upcoming,
      past: past ?? this.past,
      cancellingIds: cancellingIds ?? this.cancellingIds,
    );
  }

  @override
  List<Object?> get props => [loading, error, showUpcoming, upcoming, past, cancellingIds];
}
