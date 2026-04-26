import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../../features/auth/data/datasources/auth_local_data_source.dart';

class ApiClient {
  final http.Client client;
  final AuthLocalDataSource localDataSource;
  
  // Use 10.0.2.2 for Android emulator, and 127.0.0.1 for Web
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://127.0.0.1:8000/api';
    } else {
      return 'http://10.0.2.2:8000/api';
    }
  }

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
}
