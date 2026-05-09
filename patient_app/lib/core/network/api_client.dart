import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../features/auth/data/datasources/auth_local_data_source.dart';
import '../config/app_config.dart';

class ApiClient {
  final http.Client client;
  final AuthLocalDataSource localDataSource;
  
  static const String baseUrl = AppConfig.apiBaseUrl;

  ApiClient({required this.client, required this.localDataSource});

  Future<Map<String, String>> _getHeaders() async {
    final token = await localDataSource.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<http.Response> post(String endpoint, {Map<String, dynamic>? body}) async {
    final headers = await _getHeaders();
    return await client.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: body != null ? json.encode(body) : null,
    );
  }

  Future<http.Response> get(String endpoint) async {
    final headers = await _getHeaders();
    return await client.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );
  }

  Future<http.Response> put(String endpoint, {Map<String, dynamic>? body}) async {
    final headers = await _getHeaders();
    return await client.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: body != null ? json.encode(body) : null,
    );
  }
}
