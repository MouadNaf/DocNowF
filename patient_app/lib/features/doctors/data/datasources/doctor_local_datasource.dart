import '../../../home/domain/entities/doctor.dart';

abstract class DoctorLocalDataSource {
  Future<List<Doctor>> getCachedDoctors();
  Future<void> cacheDoctors(List<Doctor> doctors);
  Future<void> addToFavorites(String doctorId);
  Future<void> removeFromFavorites(String doctorId);
  Future<List<String>> getFavoriteIds();
}

class DoctorLocalDataSourceImpl implements DoctorLocalDataSource {
  List<Doctor>? _cachedDoctors;
  final List<String> _favoriteIds = [];

  @override
  Future<List<Doctor>> getCachedDoctors() async {
    if (_cachedDoctors == null) {
      // Initialize with mock data if no cache exists
      _cachedDoctors = [
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
          cabinetId: '1',
          cabinetType: 'private',
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
          cabinetId: '2',
          cabinetType: 'private',
          schedule: ['10:00 AM', '02:00 PM'],
        ),
      ];
    }
    return _cachedDoctors!;
  }

  @override
  Future<void> cacheDoctors(List<Doctor> doctors) async {
    _cachedDoctors = doctors;
  }

  @override
  Future<void> addToFavorites(String doctorId) async {
    if (!_favoriteIds.contains(doctorId)) {
      _favoriteIds.add(doctorId);
    }
  }

  @override
  Future<void> removeFromFavorites(String doctorId) async {
    _favoriteIds.remove(doctorId);
  }

  @override
  Future<List<String>> getFavoriteIds() async {
    return _favoriteIds;
  }
}

class CacheException implements Exception {
  final String message;
  CacheException(this.message);
}
