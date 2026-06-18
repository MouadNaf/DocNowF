import 'package:equatable/equatable.dart';
import '../../../home/domain/entities/doctor.dart';

abstract class SearchState extends Equatable {
  const SearchState();

  @override
  List<Object> get props => [];
}

class SearchInitial extends SearchState {
  final List<String> recentSearches;
  final String selectedCategory;
  final String? selectedWilaya;

  const SearchInitial({
    this.recentSearches = const [
      'Cardiologist near me',
      'Dr. Sarah Johnson',
      'Pediatrician',
      'Dentist available today',
    ],
    this.selectedCategory = 'All',
    this.selectedWilaya,
  });

  @override
  List<Object> get props =>
      [recentSearches, selectedCategory, selectedWilaya ?? ''];

  SearchInitial copyWith({
    List<String>? recentSearches,
    String? selectedCategory,
    String? selectedWilaya,
    bool clearWilaya = false,
  }) {
    return SearchInitial(
      recentSearches: recentSearches ?? this.recentSearches,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      selectedWilaya: clearWilaya ? null : (selectedWilaya ?? this.selectedWilaya),
    );
  }
}

class SearchLoading extends SearchState {}

class SearchLoaded extends SearchState {
  final List<Doctor> doctors;
  final String query;
  final String selectedCategory;
  final String? selectedWilaya;

  const SearchLoaded({
    required this.doctors,
    required this.query,
    this.selectedCategory = 'All',
    this.selectedWilaya,
  });

  @override
  List<Object> get props =>
      [doctors, query, selectedCategory, selectedWilaya ?? ''];

  SearchLoaded copyWith({
    List<Doctor>? doctors,
    String? query,
    String? selectedCategory,
    String? selectedWilaya,
    bool clearWilaya = false,
  }) {
    return SearchLoaded(
      doctors: doctors ?? this.doctors,
      query: query ?? this.query,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      selectedWilaya:
          clearWilaya ? null : (selectedWilaya ?? this.selectedWilaya),
    );
  }
}

class SearchError extends SearchState {
  final String message;
  const SearchError(this.message);

  @override
  List<Object> get props => [message];
}
