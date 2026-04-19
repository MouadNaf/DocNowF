import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../home/domain/entities/doctor.dart';
import 'search_event.dart';
import 'search_state.dart';

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  // Same mock data — in production, this will come via the repository/use-case
  static final List<Doctor> _allDoctors = [
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
      about: 'Dr. Sarah Johnson is a board-certified cardiologist with over 15 years of experience in treating heart conditions. She specializes in preventive cardiology and has helped thousands of patients improve their cardiovascular health.',
      hospital: 'MediCare Hospital, New York',
      schedule: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
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
      about: 'Dr. Michael Chen is a general dentist committed to providing excellent dental care in a comfortable environment. He specializes in cosmetic dentistry and oral hygiene.',
      hospital: 'Smile Dental Care',
      schedule: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
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
      about: 'Dr. Emily Williams is a board-certified pediatrician with over 12 years of experience in treating children from newborns to adolescents. She is known for her gentle approach and dedication to children\'s wellness.',
      hospital: 'NYC Children\'s Hospital',
      schedule: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
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
      isActive: true,
      rating: '4.7',
      reviews: '164',
      distance: '4.1 km',
      experience: '18 years',
      patients: '3,100+',
      fee: '\$110',
      about: 'Dr. James Anderson is a highly experienced neurologist specializing in complex neurological disorders. He has spent nearly two decades researching movement disorders.',
      hospital: 'Chicago Brain & Spine',
      schedule: ['08:00 AM', '11:00 AM', '03:00 PM'],
    ),
  ];

  SearchBloc() : super(const SearchInitial()) {
    on<SearchQueryChanged>(_onQueryChanged);
    on<SearchCategoryChanged>(_onCategoryChanged);
    on<ClearRecentSearch>(_onClearRecent);
    on<ClearAllRecentSearches>(_onClearAll);
  }

  void _onQueryChanged(SearchQueryChanged event, Emitter<SearchState> emit) {
    final query = event.query.trim();
    if (query.isEmpty) {
      final currentCategory = state is SearchLoaded
          ? (state as SearchLoaded).selectedCategory
          : (state is SearchInitial ? (state as SearchInitial).selectedCategory : 'All');
      emit(SearchInitial(selectedCategory: currentCategory));
      return;
    }

    emit(SearchLoading());

    final category = state is SearchLoaded
        ? (state as SearchLoaded).selectedCategory
        : 'All';

    final results = _filter(query, category);
    emit(SearchLoaded(
      doctors: results,
      query: query,
      selectedCategory: category,
    ));
  }

  void _onCategoryChanged(SearchCategoryChanged event, Emitter<SearchState> emit) {
    if (state is SearchLoaded) {
      final s = state as SearchLoaded;
      final results = _filter(s.query, event.category);
      emit(s.copyWith(selectedCategory: event.category, doctors: results));
    } else if (state is SearchInitial) {
      emit((state as SearchInitial).copyWith(selectedCategory: event.category));
    }
  }

  void _onClearRecent(ClearRecentSearch event, Emitter<SearchState> emit) {
    if (state is SearchInitial) {
      final s = state as SearchInitial;
      final updated = List<String>.from(s.recentSearches)..remove(event.term);
      emit(s.copyWith(recentSearches: updated));
    }
  }

  void _onClearAll(ClearAllRecentSearches event, Emitter<SearchState> emit) {
    if (state is SearchInitial) {
      emit((state as SearchInitial).copyWith(recentSearches: []));
    }
  }

  List<Doctor> _filter(String query, String category) {
    return _allDoctors.where((d) {
      final matchesQuery =
          d.name.toLowerCase().contains(query.toLowerCase()) ||
          d.specialty.toLowerCase().contains(query.toLowerCase());
      final matchesCategory = category == 'All' ||
          d.specialty.toLowerCase().contains(category.toLowerCase());
      return matchesQuery && matchesCategory;
    }).toList();
  }
}
