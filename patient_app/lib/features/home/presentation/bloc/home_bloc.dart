import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:patient_app/features/doctors/domain/usecases/get_doctors.dart';
import '../../../home/domain/entities/doctor.dart';
import 'home_event.dart';
import 'home_state.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  // Mock data matching backend User model (role=DOCTOR) and clinic info
  static final List<Doctor> _mockDoctors = [
    const Doctor(
      id: '1',
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
      reviews: '127',
      distance: '2.5 km',
      experience: '15 years',
      patients: '2,500+',
      fee: '\$80',
      about:
          'Dr. Sarah Johnson is a board-certified cardiologist with over 15 years of experience in treating heart conditions. She specializes in preventive cardiology and has helped thousands of patients improve their cardiovascular health.',
      hospital: 'MediCare Hospital, New York',
      cabinetId: '4',
      cabinetType: 'private',
      schedule: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
      latitude: '36.7538',
      longitude: '3.0588',
    ),
    const Doctor(
      id: '2',
      userId: 'u2',
      name: 'Dr. Michael Chen',
      email: 'michael@example.com',
      specialty: 'Dentist',
      gender: 'Male',
      city: 'San Francisco',
      address: '321 Dental Way',
      dob: '1990-11-25',
      phoneNumber: '+1234567893',
      profilePicture: 'https://i.pravatar.cc/150?img=15',
      isVerified: true,
      isActive: true,
      rating: '4.8',
      reviews: '203',
      distance: '1.2 km',
      experience: '6 years',
      patients: '1,500+',
      fee: '\$60',
      about:
          'Dr. Michael Chen is a general dentist committed to providing excellent dental care in a comfortable environment. He specializes in cosmetic dentistry and oral hygiene.',
      hospital: 'Smile Dental Care',
      cabinetId: '5',
      cabinetType: 'private',
      schedule: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
      latitude: '36.7520',
      longitude: '3.0600',
    ),
    const Doctor(
      id: '3',
      userId: 'u3',
      name: 'Dr. Emily Williams',
      email: 'emily@example.com',
      specialty: 'Pediatrician',
      gender: 'Female',
      city: 'New York',
      address: '123 Medical Ave',
      dob: '1985-05-20',
      phoneNumber: '+1234567890',
      profilePicture: 'https://i.pravatar.cc/150?img=5',
      isVerified: true,
      isActive: true,
      rating: '5.0',
      reviews: '89',
      distance: '3.8 km',
      experience: '12 years',
      patients: '1,200+',
      fee: '\$70',
      about:
          'Dr. Emily Williams is a board-certified pediatrician with over 12 years of experience in treating children from newborns to adolescents. She is known for her gentle approach and dedication to children\'s wellness.',
      hospital: 'NYC Children\'s Hospital',
      cabinetId: '6',
      cabinetType: 'private',
      schedule: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
      latitude: '36.7550',
      longitude: '3.0550',
    ),
    const Doctor(
      id: '4',
      userId: 'u4',
      name: 'Dr. James Anderson',
      email: 'james@example.com',
      specialty: 'Neurologist',
      gender: 'Male',
      city: 'Chicago',
      address: '555 Brain St',
      dob: '1975-12-12',
      phoneNumber: '+1234567894',
      profilePicture: 'https://i.pravatar.cc/150?img=12',
      isVerified: true,
      isActive: true, rating: '', reviews: '', distance: '', experience: '', patients: '', fee: '', about: '', hospital: '', cabinetId: '', cabinetType: 'private', schedule: [],
      latitude: '36.7540',
      longitude: '3.0590',
    ),
  ];

  final GetDoctors getDoctors;

  HomeBloc({required this.getDoctors}) : super(HomeInitial()) {
    on<LoadHomeData>(_onLoadHomeData);
    on<CategorySelected>(_onCategorySelected);
  }

  Future<void> _onLoadHomeData(
    LoadHomeData event,
    Emitter<HomeState> emit,
  ) async {
    emit(HomeLoading());

    final result = await getDoctors(GetDoctorsParams());

    result.fold(
      (failure) => emit(HomeError(failure.message)),
      (doctors) => emit(
        HomeLoaded(
          availableDoctors: doctors,
          selectedCategory: 'All',
          userName:
              'Patient', // In a real app, fetch from AuthBloc or UserUseCase
        ),
      ),
    );
  }

  void _onCategorySelected(
    CategorySelected event,
    Emitter<HomeState> emit,
  ) async {
    if (state is HomeLoaded) {
      final current = state as HomeLoaded;
      emit(HomeLoading());

      final result = await getDoctors(
        GetDoctorsParams(
          specialty: event.category == 'All' ? null : event.category,
        ),
      );

      result.fold(
        (failure) => emit(HomeError(failure.message)),
        (doctors) => emit(
          current.copyWith(
            selectedCategory: event.category,
            availableDoctors: doctors,
          ),
        ),
      );
    }
  }
}
