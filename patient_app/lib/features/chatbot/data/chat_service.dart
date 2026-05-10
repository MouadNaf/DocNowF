import 'dart:convert';
import 'package:patient_app/core/network/api_client.dart';

// ─── Response models ─────────────────────────────────────────────────────────

class ChatResponse {
  final bool success;
  final String message;
  final String type; // 'text' | 'doctors' | 'appointments'
  final List<dynamic> data;

  const ChatResponse({
    required this.success,
    required this.message,
    required this.type,
    required this.data,
  });

  factory ChatResponse.fromJson(Map<String, dynamic> json) {
    return ChatResponse(
      success: json['success'] as bool? ?? true,
      message: json['message'] as String? ?? '',
      type: json['type'] as String? ?? 'text',
      data: json['data'] as List<dynamic>? ?? [],
    );
  }
}

class ChatDoctorData {
  final String id;
  final String name;
  final String specialty;
  final String city;
  final String profilePicture;
  final String fee;
  final String hospital;
  final String cabinetId;
  final String cabinetType;

  const ChatDoctorData({
    required this.id,
    required this.name,
    required this.specialty,
    required this.city,
    required this.profilePicture,
    required this.fee,
    required this.hospital,
    required this.cabinetId,
    required this.cabinetType,
  });

  factory ChatDoctorData.fromJson(Map<String, dynamic> json) {
    return ChatDoctorData(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Doctor',
      specialty: json['specialty']?.toString() ?? '',
      city: json['city']?.toString() ?? '',
      profilePicture: json['profile_picture']?.toString() ?? '',
      fee: json['fee']?.toString() ?? '',
      hospital: json['hospital']?.toString() ?? '',
      cabinetId: json['cabinet_id']?.toString() ?? '',
      cabinetType: json['cabinet_type']?.toString() ?? 'private',
    );
  }
}

class ChatAppointmentData {
  final String id;
  final String doctorName;
  final String doctorSpecialty;
  final String doctorImage;
  final String date;
  final String time;
  final String status;
  final String location;

  const ChatAppointmentData({
    required this.id,
    required this.doctorName,
    required this.doctorSpecialty,
    required this.doctorImage,
    required this.date,
    required this.time,
    required this.status,
    required this.location,
  });

  factory ChatAppointmentData.fromJson(Map<String, dynamic> json) {
    return ChatAppointmentData(
      id: json['id']?.toString() ?? '',
      doctorName: json['doctor_name']?.toString() ?? 'Doctor',
      doctorSpecialty: json['doctor_specialty']?.toString() ?? '',
      doctorImage: json['doctor_image']?.toString() ?? '',
      date: json['date']?.toString() ?? '',
      time: json['time']?.toString() ?? '',
      status: json['status']?.toString() ?? 'confirmed',
      location: json['location']?.toString() ?? '',
    );
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

class ChatService {
  final ApiClient _apiClient;

  const ChatService({required ApiClient apiClient}) : _apiClient = apiClient;

  Future<ChatResponse> sendMessage(String message) async {
    try {
      final response = await _apiClient.post(
        '/chat',
        body: {'message': message},
      );

      print('Chatbot DEBUG: Status Code: ${response.statusCode}');
      print('Chatbot DEBUG: Body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final json = jsonDecode(response.body) as Map<String, dynamic>;
        return ChatResponse.fromJson(json);
      }

      try {
        final error = jsonDecode(response.body);
        return ChatResponse(
          success: false,
          message: error['message'] ?? 'Server error (${response.statusCode})',
          type: 'text',
          data: [],
        );
      } catch (_) {
        return ChatResponse(
          success: false,
          message: 'Server error (${response.statusCode}). Please try again later.',
          type: 'text',
          data: [],
        );
      }
    } catch (e) {
      print('Chatbot DEBUG: Exception: $e');
      return const ChatResponse(
        success: false,
        message: 'Connection error. Please check your internet and try again.',
        type: 'text',
        data: [],
      );
    }
  }
}
