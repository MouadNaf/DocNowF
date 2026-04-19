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

  const SearchInitial({
    this.recentSearches = const [
      'Cardiologist near me',
      'Dr. Sarah Johnson',
      'Pediatrician',
      'Dentist available today',
    ],
    this.selectedCategory = 'All',
  });

  @override
  List<Object> get props => [recentSearches, selectedCategory];

  SearchInitial copyWith({
    List<String>? recentSearches,
    String? selectedCategory,
  }) {
    return SearchInitial(
      recentSearches: recentSearches ?? this.recentSearches,
      selectedCategory: selectedCategory ?? this.selectedCategory,
    );
  }
}

class SearchLoading extends SearchState {}

class SearchLoaded extends SearchState {
  final List<Doctor> doctors;
  final String query;
  final String selectedCategory;

  const SearchLoaded({
    required this.doctors,
    required this.query,
    this.selectedCategory = 'All',
  });

  @override
  List<Object> get props => [doctors, query, selectedCategory];

  SearchLoaded copyWith({
    List<Doctor>? doctors,
    String? query,
    String? selectedCategory,
  }) {
    return SearchLoaded(
      doctors: doctors ?? this.doctors,
      query: query ?? this.query,
      selectedCategory: selectedCategory ?? this.selectedCategory,
    );
  }
}

class SearchError extends SearchState {
  final String message;
  const SearchError(this.message);

  @override
  List<Object> get props => [message];
}
