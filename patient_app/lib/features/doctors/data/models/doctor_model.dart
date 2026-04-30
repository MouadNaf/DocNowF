import '../../../home/domain/entities/doctor.dart';

class DoctorModel extends Doctor {
  const DoctorModel({
    required super.id,
    required super.userId,
    required super.name,
    required super.email,
    required super.specialty,
    required super.gender,
    required super.city,
    required super.address,
    required super.dob,
    required super.phoneNumber,
    required super.profilePicture,
    required super.isVerified,
    required super.isActive,
    required super.rating,
    required super.reviews,
    required super.distance,
    required super.experience,
    required super.patients,
    required super.fee,
    required super.about,
    required super.hospital,
    required super.cabinetId,
    required super.cabinetType,
    required super.schedule,
  });

  factory DoctorModel.fromJson(Map<String, dynamic> json) {
    return DoctorModel(
      id: json['id'].toString(),
      userId: json['user_id'].toString(),
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      specialty: json['specialty'] ?? '',
      gender: json['gender'] ?? '',
      city: json['city'] ?? '',
      address: json['address'] ?? '',
      dob: json['date_of_birth'] ?? '',
      phoneNumber: json['phone_number'] ?? '',
      profilePicture: (json['profile_picture'] != null && json['profile_picture'].toString().isNotEmpty)
          ? json['profile_picture'].toString()
          : 'https://ui-avatars.com/api/?name=${Uri.encodeComponent(json['name'] ?? 'Doctor')}&background=random',
      isVerified: json['is_verified'] == true || json['is_verified'] == 1,
      isActive: json['is_active'] == true || json['is_active'] == 1,
      rating: json['rating']?.toString() ?? '0.0',
      reviews: json['reviews']?.toString() ?? '0',
      distance: json['distance']?.toString() ?? '',
      experience: json['experience']?.toString() ?? '',
      patients: json['patients']?.toString() ?? '',
      fee: json['fee'] ?? '',
      about: json['about'] ?? '',
      hospital: json['hospital'] ?? '',
      cabinetId: json['cabinet_id']?.toString() ?? '',
      cabinetType: json['cabinet_type']?.toString() ?? '',
      schedule: (json['schedule'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}
