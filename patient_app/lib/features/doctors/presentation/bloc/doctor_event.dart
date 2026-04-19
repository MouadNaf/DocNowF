part of 'doctor_bloc.dart';

abstract class DoctorEvent extends Equatable {
  const DoctorEvent();

  @override
  List<Object?> get props => [];
}

class GetDoctorsEvent extends DoctorEvent {
  final String? specialty;
  final String? sortBy;
  final String? availability;
  final String? priceRange;
  final String? distance;

  const GetDoctorsEvent({
    this.specialty,
    this.sortBy,
    this.availability,
    this.priceRange,
    this.distance,
  });

  @override
  List<Object?> get props => [
        specialty,
        sortBy,
        availability,
        priceRange,
        distance,
      ];
}

class SearchDoctorsEvent extends DoctorEvent {
  final String query;

  const SearchDoctorsEvent(this.query);

  @override
  List<Object> get props => [query];
}

class GetDoctorDetailsEvent extends DoctorEvent {
  final String doctorId;

  const GetDoctorDetailsEvent(this.doctorId);

  @override
  List<Object> get props => [doctorId];
}

class ToggleFavoriteEvent extends DoctorEvent {
  final String doctorId;

  const ToggleFavoriteEvent(this.doctorId);

  @override
  List<Object> get props => [doctorId];
}

class GetFavoriteDoctorsEvent extends DoctorEvent {}
