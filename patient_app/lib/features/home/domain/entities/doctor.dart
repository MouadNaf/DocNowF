import 'package:equatable/equatable.dart';

class Doctor extends Equatable {
  final String id;
  final String userId;
  final String name;
  final String email;
  final String specialty;
  final String gender;
  final String city;
  final String address;
  final String dob;
  final String phoneNumber;
  final String profilePicture;
  final bool isVerified;
  final bool isActive;
  final String rating;
  final String reviews;
  final String distance;
  final String experience;
  final String patients;
  final String fee;
  final String about;
  final String hospital;
  final String cabinetId;
  final String cabinetType;
  final List<String> schedule;
  final bool isFavorite;
  final String latitude;
  final String longitude;

  const Doctor({
    required this.id,
    required this.userId,
    required this.name,
    required this.email,
    required this.specialty,
    required this.gender,
    required this.city,
    required this.address,
    required this.dob,
    required this.phoneNumber,
    required this.profilePicture,
    required this.isVerified,
    required this.isActive,
    required this.rating,
    required this.reviews,
    required this.distance,
    required this.experience,
    required this.patients,
    required this.fee,
    required this.about,
    required this.hospital,
    required this.cabinetId,
    required this.cabinetType,
    required this.schedule,
    required this.latitude,
    required this.longitude,
    this.isFavorite = false,
  });

  @override
  List<Object?> get props => [
        id, userId, name, email, specialty, gender, city, address, dob,
        phoneNumber, profilePicture, isVerified, isActive, rating, reviews,
        distance, experience, patients, fee, about, hospital, cabinetId, cabinetType, schedule,
        isFavorite, latitude, longitude,
      ];

  Doctor copyWith({bool? isFavorite}) {
    return Doctor(
      id: id,
      userId: userId,
      name: name,
      email: email,
      specialty: specialty,
      gender: gender,
      city: city,
      address: address,
      dob: dob,
      phoneNumber: phoneNumber,
      profilePicture: profilePicture,
      isVerified: isVerified,
      isActive: isActive,
      rating: rating,
      reviews: reviews,
      distance: distance,
      experience: experience,
      patients: patients,
      fee: fee,
      about: about,
      hospital: hospital,
      cabinetId: cabinetId,
      cabinetType: cabinetType,
      schedule: schedule,
      latitude: latitude,
      longitude: longitude,
      isFavorite: isFavorite ?? this.isFavorite,
    );
  }
}
