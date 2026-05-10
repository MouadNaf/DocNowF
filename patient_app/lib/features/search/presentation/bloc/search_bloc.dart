import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/network/api_client.dart';
import '../../../home/domain/entities/doctor.dart';
import '../../../doctors/data/models/doctor_model.dart';
import 'search_event.dart';
import 'search_state.dart';

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  final ApiClient apiClient;

  SearchBloc({required this.apiClient}) : super(const SearchInitial()) {
    on<SearchQueryChanged>(_onQueryChanged);
    on<SearchCategoryChanged>(_onCategoryChanged);
    on<ClearRecentSearch>(_onClearRecent);
    on<ClearAllRecentSearches>(_onClearAll);
  }

  Future<void> _onQueryChanged(SearchQueryChanged event, Emitter<SearchState> emit) async {
    final query = event.query.trim();
    final currentCategory = _getCurrentCategory();

    if (query.isEmpty) {
      emit(SearchInitial(selectedCategory: currentCategory));
      return;
    }

    emit(SearchLoading());

    try {
      final results = await _fetchFromApi(query, currentCategory);
      emit(SearchLoaded(
        doctors: results,
        query: query,
        selectedCategory: currentCategory,
      ));
    } catch (e) {
      emit(SearchLoaded(
        doctors: const [],
        query: query,
        selectedCategory: currentCategory,
      ));
    }
  }

  Future<void> _onCategoryChanged(SearchCategoryChanged event, Emitter<SearchState> emit) async {
    final currentQuery = _getCurrentQuery();
    
    if (state is SearchInitial) {
      emit((state as SearchInitial).copyWith(selectedCategory: event.category));
      if (currentQuery.isNotEmpty) {
        add(SearchQueryChanged(currentQuery));
      }
    } else if (state is SearchLoaded) {
      emit(SearchLoading());
      try {
        final results = await _fetchFromApi(currentQuery, event.category);
        emit(SearchLoaded(
          doctors: results,
          query: currentQuery,
          selectedCategory: event.category,
        ));
      } catch (e) {
        emit(SearchLoaded(
          doctors: const [],
          query: currentQuery,
          selectedCategory: event.category,
        ));
      }
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

  String _getCurrentCategory() {
    if (state is SearchLoaded) return (state as SearchLoaded).selectedCategory;
    if (state is SearchInitial) return (state as SearchInitial).selectedCategory;
    return 'All';
  }

  String _getCurrentQuery() {
    if (state is SearchLoaded) return (state as SearchLoaded).query;
    return '';
  }

  Future<List<Doctor>> _fetchFromApi(String query, String category) async {
    final String specialtyParam = category == 'All' ? '' : '&specialty=$category';
    final response = await apiClient.get('/doctors?search=$query$specialtyParam');

    if (response.statusCode == 200) {
      final Map<String, dynamic> body = jsonDecode(response.body);
      final List<dynamic> data = body['data'];
      return data.map((json) => DoctorModel.fromJson(json)).toList();
    }
    return [];
  }
}
