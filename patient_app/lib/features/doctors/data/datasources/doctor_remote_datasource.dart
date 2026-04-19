import '../../../home/domain/entities/doctor.dart';

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
  @override
  Future<List<Doctor>> getDoctors({
    String? specialty,
    String? sortBy,
    String? availability,
    String? priceRange,
    String? distance,
  }) async {
    // Mock API call - in real app, this would make HTTP requests
    await Future.delayed(const Duration(seconds: 1));
    
    List<Doctor> allDoctors = [
      const Doctor(
        id: '1',
        userId: 'u1',
        name: 'Dr. Emily Williams',
        email: 'emily@example.com',
        specialty: 'Pediatrician',
        gender: 'Female',
        city: 'New York',
        address: '123 Medical Ave',
        dob: '1985-05-20',
        phoneNumber: '+1234567890',
        profilePicture: 'https://i.pravatar.cc/150?img=1',
        isVerified: true,
        isActive: true,
        rating: '5.0',
        reviews: '89',
        distance: '3.8 km',
        experience: '12 years',
        patients: '1,200+',
        fee: '\$70',
        about: 'Dr. Emily Williams is a board-certified pediatrician...',
        hospital: 'NYC Children\'s Hospital',
        schedule: ['09:00 AM', '10:00 AM'],
      ),
      const Doctor(
        id: '2',
        userId: 'u2',
        name: 'Dr. Michael Chen',
        email: 'michael@example.com',
        specialty: 'Cardiologist',
        gender: 'Male',
        city: 'San Francisco',
        address: '321 Dental Way',
        dob: '1990-11-25',
        phoneNumber: '+1234567893',
        profilePicture: 'https://i.pravatar.cc/150?img=2',
        isVerified: true,
        isActive: true,
        rating: '4.8',
        reviews: '156',
        distance: '2.1 km',
        experience: '15 years',
        patients: '2,500+',
        fee: '\$120',
        about: 'Dr. Michael Chen is a highly experienced cardiologist...',
        hospital: 'Smile Health Care',
        schedule: ['10:00 AM', '02:00 PM'],
      ),
      const Doctor(
        id: '3',
        userId: 'u3',
        name: 'Dr. Sarah Johnson',
        email: 'sarah@example.com',
        specialty: 'Dermatologist',
        gender: 'Female',
        city: 'Boston',
        address: '789 Heart Center',
        dob: '1980-03-10',
        phoneNumber: '+1234567892',
        profilePicture: 'https://i.pravatar.cc/150?img=3',
        isVerified: true,
        isActive: false,
        rating: '4.9',
        reviews: '203',
        distance: '5.2 km',
        experience: '10 years',
        patients: '1,800+',
        fee: '\$100',
        about: 'Dr. Sarah Johnson is a specialist in dermatology...',
        hospital: 'MediCare Hospital',
        schedule: ['09:00 AM', '11:00 AM'],
      ),
    ];

    // Apply filters
    var filteredDoctors = allDoctors;

    if (specialty != null && specialty.isNotEmpty) {
      filteredDoctors = filteredDoctors
          .where((doc) => doc.specialty.toLowerCase().contains(specialty.toLowerCase()))
          .toList();
    }

    if (availability != null && availability.isNotEmpty) {
      if (availability == 'Available Today') {
        filteredDoctors = filteredDoctors.where((doc) => doc.isActive).toList();
      }
    }

    // Apply sorting
    if (sortBy != null) {
      switch (sortBy) {
        case 'Highest Rating':
          filteredDoctors.sort((a, b) => double.parse(b.rating).compareTo(double.parse(a.rating)));
          break;
        case 'Lowest Rating':
          filteredDoctors.sort((a, b) => double.parse(a.rating).compareTo(double.parse(b.rating)));
          break;
        case 'Nearest':
          filteredDoctors.sort((a, b) {
            double aDistance = double.parse(a.distance.replaceAll(' km', ''));
            double bDistance = double.parse(b.distance.replaceAll(' km', ''));
            return aDistance.compareTo(bDistance);
          });
          break;
      }
    }

    return filteredDoctors;
  }

  @override
  Future<Doctor> getDoctorById(String id) async {
    await Future.delayed(const Duration(seconds: 1));
    
    final allDoctors = await getDoctors();
    final doctor = allDoctors.firstWhere(
      (doc) => doc.id == id,
      orElse: () => throw Exception('Doctor not found'),
    );
    
    return doctor;
  }

  @override
  Future<List<Doctor>> searchDoctors(String query) async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    final allDoctors = await getDoctors();
    final filteredDoctors = allDoctors
        .where((doc) =>
            doc.name.toLowerCase().contains(query.toLowerCase()) ||
            doc.specialty.toLowerCase().contains(query.toLowerCase()))
        .toList();
    
    return filteredDoctors;
  }
}

class ServerException implements Exception {
  final String message;
  ServerException(this.message);
}
