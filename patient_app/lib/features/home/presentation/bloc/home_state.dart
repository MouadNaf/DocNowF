import 'package:equatable/equatable.dart';
import '../../../home/domain/entities/doctor.dart';

abstract class HomeState extends Equatable {
  const HomeState();

  @override
  List<Object?> get props => [];
}

class HomeInitial extends HomeState {}

class HomeLoading extends HomeState {}

class HomeLoaded extends HomeState {
  final List<Doctor> availableDoctors;
  final String selectedCategory;
  final String userName;

  const HomeLoaded({
    required this.availableDoctors,
    required this.selectedCategory,
    required this.userName,
  });

  @override
  List<Object?> get props => [availableDoctors, selectedCategory, userName];

  HomeLoaded copyWith({
    List<Doctor>? availableDoctors,
    String? selectedCategory,
    String? userName,
  }) {
    return HomeLoaded(
      availableDoctors: availableDoctors ?? this.availableDoctors,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      userName: userName ?? this.userName,
    );
  }
}

class HomeError extends HomeState {
  final String message;
  const HomeError(this.message);

  @override
  List<Object?> get props => [message];
}
