import 'dart:convert';
import '../../../../core/error/exceptions.dart';
import '../../../../core/network/api_client.dart';
import '../models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<Map<String, dynamic>> login(String email, String password);
  Future<Map<String, dynamic>> register(Map<String, dynamic> data);
  Future<void> logout();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiClient apiClient;

  AuthRemoteDataSourceImpl({required this.apiClient});

  @override
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await apiClient.post(
      '/login',
      body: {'email': email, 'password': password},
    );

    if (response.statusCode == 200) {
      final jsonResponse = json.decode(response.body);
      return {
        'user': UserModel.fromJson(jsonResponse['user']),
        'token': jsonResponse['token'],
      };
    } else {
      final jsonResponse = json.decode(response.body);
      throw ServerException(jsonResponse['message'] ?? 'Login failed');
    }
  }

  @override
  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final response = await apiClient.post(
      '/register',
      body: data,
    );

    if (response.statusCode == 201) {
      final jsonResponse = json.decode(response.body);
      return {
        'user': UserModel.fromJson(jsonResponse['user']),
        'token': jsonResponse['token'],
      };
    } else {
      final jsonResponse = json.decode(response.body);
      String errorMessage = jsonResponse['error'] ?? 'Registration failed';
      if (jsonResponse['errors'] != null) {
        // Just extract the first validation error message for simplicity
        final Map<String, dynamic> errors = jsonResponse['errors'];
        errorMessage = errors.values.first[0];
      }
      throw ServerException(errorMessage);
    }
  }

  @override
  Future<void> logout() async {
    final response = await apiClient.post('/logout');
    if (response.statusCode != 200) {
      throw ServerException('Logout failed');
    }
  }
}
