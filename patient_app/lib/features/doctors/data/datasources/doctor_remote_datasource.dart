import 'dart:convert';
import '../../../../core/network/api_client.dart';
import '../../../home/domain/entities/doctor.dart';
import '../models/doctor_model.dart';

abstract class DoctorRemoteDataSource {
  Future<List<Doctor>> getDoctors({
    String? specialty,
    String? sortBy,
    String? availability,
    String? priceRange,
    String? distance,
  });

  Future<Doctor> getDoctorById(String id);

  Future<List<Doctor>> searchDoctors(String query);
}

class DoctorRemoteDataSourceImpl implements DoctorRemoteDataSource {
  final ApiClient apiClient;

  DoctorRemoteDataSourceImpl({required this.apiClient});

  @override
  Future<List<Doctor>> getDoctors({
    String? specialty,
    String? sortBy,
    String? availability,
    String? priceRange,
    String? distance,
  }) async {
    final response = await apiClient.get('/doctors');

    if (response.statusCode == 200) {
      final Map<String, dynamic> data = json.decode(response.body);
      final List doctors = data['data'];
      return doctors.map((json) => DoctorModel.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load doctors');
    }
  }

  @override
  Future<Doctor> getDoctorById(String id) async {
    final response = await apiClient.get('/doctors/$id');

    if (response.statusCode == 200) {
      final Map<String, dynamic> data = json.decode(response.body);
      return DoctorModel.fromJson(data['data']);
    } else {
      throw Exception('Failed to load doctor details');
    }
  }

  @override
  Future<List<Doctor>> searchDoctors(String query) async {
    final response = await apiClient.get('/doctors?search=$query');

    if (response.statusCode == 200) {
      final Map<String, dynamic> data = json.decode(response.body);
      final List doctors = data['data'];
      return doctors.map((json) => DoctorModel.fromJson(json)).toList();
    } else {
      throw Exception('Failed to search doctors');
    }
  }
}
