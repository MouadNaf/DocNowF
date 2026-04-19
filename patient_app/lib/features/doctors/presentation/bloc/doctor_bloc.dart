import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:dartz/dartz.dart';

import '../../../home/domain/entities/doctor.dart';
import '../../domain/usecases/get_doctors.dart';
import '../../domain/usecases/search_doctors.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';

part 'doctor_event.dart';
part 'doctor_state.dart';

class DoctorBloc extends Bloc<DoctorEvent, DoctorState> {
  final GetDoctors getDoctors;
  final SearchDoctors searchDoctors;

  DoctorBloc({
    required this.getDoctors,
    required this.searchDoctors,
  }) : super(DoctorInitial()) {
    on<GetDoctorsEvent>(_onGetDoctors);
    on<SearchDoctorsEvent>(_onSearchDoctors);
    on<GetDoctorDetailsEvent>(_onGetDoctorDetails);
    on<ToggleFavoriteEvent>(_onToggleFavorite);
    on<GetFavoriteDoctorsEvent>(_onGetFavoriteDoctors);
  }

  Future<void> _onGetDoctors(
    GetDoctorsEvent event,
    Emitter<DoctorState> emit,
  ) async {
    emit(DoctorLoading());
    final params = GetDoctorsParams(
      specialty: event.specialty,
      sortBy: event.sortBy,
      availability: event.availability,
      priceRange: event.priceRange,
      distance: event.distance,
    );

    final result = await getDoctors(params);

    emit(result.fold(
      (failure) => DoctorError(_mapFailureToMessage(failure)),
      (doctors) => DoctorLoaded(doctors),
    ));
  }

  Future<void> _onSearchDoctors(
    SearchDoctorsEvent event,
    Emitter<DoctorState> emit,
  ) async {
    emit(DoctorLoading());
    final result = await searchDoctors(event.query);

    emit(result.fold(
      (failure) => DoctorError(_mapFailureToMessage(failure)),
      (doctors) => DoctorLoaded(doctors),
    ));
  }

  Future<void> _onGetDoctorDetails(
    GetDoctorDetailsEvent event,
    Emitter<DoctorState> emit,
  ) async {
    emit(DoctorLoading());
    // Mock implementation - in real app, you'd have a GetDoctor usecase
    final mockDoctor = Doctor(
      id: event.doctorId,
      userId: 'u1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah@example.com',
      specialty: 'Cardiologist',
      gender: 'Female',
      city: 'Boston',
      address: '789 Heart Center',
      dob: '1980-03-10',
      phoneNumber: '+1234567892',
      profilePicture: 'https://i.pravatar.cc/150?img=11',
      isVerified: true,
      isActive: true,
      rating: '4.9',
      reviews: '203',
      distance: '2.5 km',
      experience: '15 years',
      patients: '2,500+',
      fee: '\$80',
      about: 'Dr. Sarah Johnson is a board-certified cardiologist...',
      hospital: 'MediCare Hospital, New York',
      schedule: const ['09:00 AM', '10:00 AM', '11:00 AM'],
    );

    emit(DoctorDetailsLoaded(mockDoctor));
  }

  Future<void> _onToggleFavorite(
    ToggleFavoriteEvent event,
    Emitter<DoctorState> emit,
  ) async {
    // Mock implementation - in real app, you'd call repository methods
    if (state is DoctorLoaded) {
      final doctors = (state as DoctorLoaded).doctors;
      emit(DoctorLoaded(doctors));
    }
  }

  Future<void> _onGetFavoriteDoctors(
    GetFavoriteDoctorsEvent event,
    Emitter<DoctorState> emit,
  ) async {
    emit(DoctorLoading());
    // Mock implementation - in real app, you'd call repository method
    final mockFavoriteDoctors = <Doctor>[];
    emit(FavoriteDoctorsLoaded(mockFavoriteDoctors));
  }

  String _mapFailureToMessage(Failure failure) {
    switch (failure.runtimeType) {
      case ServerFailure:
        return 'Server error occurred. Please try again later.';
      case NetworkFailure:
        return 'Network error occurred. Please check your internet connection.';
      default:
        return 'An unexpected error occurred.';
    }
  }
}
