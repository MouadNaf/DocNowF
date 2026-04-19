part of 'doctor_bloc.dart';

abstract class DoctorState extends Equatable {
  const DoctorState();

  @override
  List<Object?> get props => [];
}

class DoctorInitial extends DoctorState {}

class DoctorLoading extends DoctorState {}

class DoctorLoaded extends DoctorState {
  final List<Doctor> doctors;

  const DoctorLoaded(this.doctors);

  @override
  List<Object?> get props => [doctors];
}

class DoctorDetailsLoaded extends DoctorState {
  final Doctor doctor;

  const DoctorDetailsLoaded(this.doctor);

  @override
  List<Object?> get props => [doctor];
}

class FavoriteDoctorsLoaded extends DoctorState {
  final List<Doctor> favoriteDoctors;

  const FavoriteDoctorsLoaded(this.favoriteDoctors);

  @override
  List<Object?> get props => [favoriteDoctors];
}

class DoctorError extends DoctorState {
  final String message;

  const DoctorError(this.message);

  @override
  List<Object?> get props => [message];
}
