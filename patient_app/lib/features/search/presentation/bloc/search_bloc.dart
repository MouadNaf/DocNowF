import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/network/api_client.dart';
import '../../../home/domain/entities/doctor.dart';
import '../../../doctors/data/models/doctor_model.dart';
import 'search_event.dart';
import 'search_state.dart';

/// Approximate center coordinates for all 58 Algerian wilayas.
const Map<String, List<double>> wilayaCenters = {
  'Adrar': [27.8742, -0.2839],
  'Chlef': [36.1638, 1.3300],
  'Laghouat': [33.8000, 2.8833],
  'Oum El Bouaghi': [35.8742, 7.1108],
  'Batna': [35.5556, 6.1742],
  'Béjaïa': [36.7509, 5.0564],
  'Biskra': [34.8500, 5.7333],
  'Bechar': [31.6167, -2.2167],
  'Blida': [36.4722, 2.8294],
  'Bouira': [36.3800, 3.9003],
  'Tamanrasset': [22.7853, 5.5228],
  'Tébessa': [35.4042, 8.1208],
  'Tlemcen': [34.8828, -1.3167],
  'Tiaret': [35.3667, 1.3167],
  'Tizi Ouzou': [36.7117, 4.0456],
  'Alger': [36.7372, 3.0865],
  'Djelfa': [34.6753, 3.2631],
  'Jijel': [36.8222, 5.7667],
  'Sétif': [36.1898, 5.4108],
  'Saida': [34.8303, 0.1517],
  'Skikda': [36.8762, 6.9019],
  'Sidi Bel Abbes': [35.2028, -0.6306],
  'Annaba': [36.9000, 7.7667],
  'Guelma': [36.4639, 7.4256],
  'Constantine': [36.3650, 6.6147],
  'Médéa': [36.2639, 2.7525],
  'Mostaganem': [35.9311, 0.0892],
  "M'Sila": [35.7072, 4.5408],
  'Mascara': [35.3961, 0.1400],
  'Ouargla': [31.9500, 5.3167],
  'Oran': [35.6987, -0.6349],
  'El Bayadh': [33.6833, 1.0167],
  'Illizi': [26.5067, 8.4681],
  'Bordj Bou Arreridj': [36.0731, 4.7631],
  'Boumerdès': [36.7667, 3.4769],
  'El Tarf': [36.7672, 8.3131],
  'Tindouf': [27.6731, -8.1472],
  'Tissemsilt': [35.6069, 1.8133],
  'El Oued': [33.3681, 6.8636],
  'Khenchela': [35.4353, 7.1425],
  'Souk Ahras': [36.2864, 7.9511],
  'Tipaza': [36.5897, 2.4472],
  'Mila': [36.4500, 6.2631],
  'Ain Defla': [36.2642, 1.9669],
  'Naama': [33.2667, -0.3167],
  'Ain Temouchent': [35.2978, -1.1403],
  'Ghardaia': [32.4908, 3.6731],
  'Relizane': [35.7333, 0.5667],
  'Timimoun': [29.2639, 0.2306],
  'Bordj Badji Mokhtar': [21.3250, 0.9500],
  'Ouled Djellal': [34.4167, 5.0667],
  'Béni Abbès': [30.1333, -2.1667],
  'In Salah': [27.1933, 2.4672],
  'In Guezzam': [19.5667, 5.7667],
  'Touggourt': [33.1000, 6.0667],
  'Djanet': [24.5547, 9.4853],
  'El Meghaier': [33.9500, 5.9167],
  'El Meniaa': [30.5833, 2.8833],
};

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  final ApiClient apiClient;

  SearchBloc({required this.apiClient}) : super(const SearchInitial()) {
    on<SearchQueryChanged>(_onQueryChanged);
    on<SearchCategoryChanged>(_onCategoryChanged);
    on<SearchWilayaChanged>(_onWilayaChanged);
    on<ClearRecentSearch>(_onClearRecent);
    on<ClearAllRecentSearches>(_onClearAll);
  }

  Future<void> _onQueryChanged(
      SearchQueryChanged event, Emitter<SearchState> emit) async {
    final query = event.query.trim();
    final currentCategory = _getCurrentCategory();
    final currentWilaya = _getCurrentWilaya();

    if (query.isEmpty && currentWilaya == null) {
      emit(SearchInitial(selectedCategory: currentCategory));
      return;
    }

    emit(SearchLoading());

    try {
      final results =
          await _fetchFromApi(query, currentCategory, currentWilaya);
      emit(SearchLoaded(
        doctors: results,
        query: query,
        selectedCategory: currentCategory,
        selectedWilaya: currentWilaya,
      ));
    } catch (_) {
      emit(SearchLoaded(
        doctors: const [],
        query: query,
        selectedCategory: currentCategory,
        selectedWilaya: currentWilaya,
      ));
    }
  }

  Future<void> _onCategoryChanged(
      SearchCategoryChanged event, Emitter<SearchState> emit) async {
    final currentQuery = _getCurrentQuery();
    final currentWilaya = _getCurrentWilaya();

    if (state is SearchInitial) {
      emit((state as SearchInitial)
          .copyWith(selectedCategory: event.category));
      if (currentQuery.isNotEmpty || currentWilaya != null) {
        add(SearchQueryChanged(currentQuery));
      }
    } else if (state is SearchLoaded) {
      emit(SearchLoading());
      try {
        final results =
            await _fetchFromApi(currentQuery, event.category, currentWilaya);
        emit(SearchLoaded(
          doctors: results,
          query: currentQuery,
          selectedCategory: event.category,
          selectedWilaya: currentWilaya,
        ));
      } catch (_) {
        emit(SearchLoaded(
          doctors: const [],
          query: currentQuery,
          selectedCategory: event.category,
          selectedWilaya: currentWilaya,
        ));
      }
    }
  }

  Future<void> _onWilayaChanged(
      SearchWilayaChanged event, Emitter<SearchState> emit) async {
    final currentQuery = _getCurrentQuery();
    final currentCategory = _getCurrentCategory();
    final newWilaya = event.wilaya;

    if (currentQuery.isEmpty && newWilaya == null) {
      if (state is SearchInitial) {
        emit((state as SearchInitial).copyWith(clearWilaya: true));
      } else {
        emit(SearchInitial(selectedCategory: currentCategory));
      }
      return;
    }

    emit(SearchLoading());
    try {
      final results =
          await _fetchFromApi(currentQuery, currentCategory, newWilaya);
      emit(SearchLoaded(
        doctors: results,
        query: currentQuery,
        selectedCategory: currentCategory,
        selectedWilaya: newWilaya,
      ));
    } catch (_) {
      emit(SearchLoaded(
        doctors: const [],
        query: currentQuery,
        selectedCategory: currentCategory,
        selectedWilaya: newWilaya,
      ));
    }
  }

  void _onClearRecent(
      ClearRecentSearch event, Emitter<SearchState> emit) {
    if (state is SearchInitial) {
      final s = state as SearchInitial;
      final updated = List<String>.from(s.recentSearches)
        ..remove(event.term);
      emit(s.copyWith(recentSearches: updated));
    }
  }

  void _onClearAll(
      ClearAllRecentSearches event, Emitter<SearchState> emit) {
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

  String? _getCurrentWilaya() {
    if (state is SearchLoaded) return (state as SearchLoaded).selectedWilaya;
    if (state is SearchInitial) return (state as SearchInitial).selectedWilaya;
    return null;
  }

  Future<List<Doctor>> _fetchFromApi(
      String query, String category, String? wilaya) async {
    final params = StringBuffer();
    if (query.isNotEmpty) params.write('search=${Uri.encodeComponent(query)}');
    if (category != 'All') {
      if (params.isNotEmpty) params.write('&');
      params.write('specialty=${Uri.encodeComponent(category)}');
    }
    if (wilaya != null) {
      if (params.isNotEmpty) params.write('&');
      params.write('wilaya=${Uri.encodeComponent(wilaya)}');
      final center = wilayaCenters[wilaya];
      if (center != null) {
        params.write('&ref_lat=${center[0]}&ref_lon=${center[1]}');
      }
    }

    final response = await apiClient.get('/doctors?$params');
    if (response.statusCode == 200) {
      final Map<String, dynamic> body = jsonDecode(response.body);
      final List<dynamic> data = body['data'];
      return data.map((json) => DoctorModel.fromJson(json)).toList();
    }
    return [];
  }
}
