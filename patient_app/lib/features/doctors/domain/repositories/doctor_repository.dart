import 'package:dartz/dartz.dart';
import '../../../home/domain/entities/doctor.dart';
import '../../../../core/error/failures.dart';

abstract class DoctorRepository {
  Future<Either<Failure, List<Doctor>>> getDoctors({
    String? specialty,
    String? sortBy,
    String? availability,
    String? priceRange,
    String? distance,
  });

  Future<Either<Failure, Doctor>> getDoctorById(String id);

  Future<Either<Failure, List<Doctor>>> searchDoctors(String query);

  Future<Either<Failure, void>> addToFavorites(String doctorId);

  Future<Either<Failure, void>> removeFromFavorites(String doctorId);

  Future<Either<Failure, List<Doctor>>> getFavoriteDoctors();
}
