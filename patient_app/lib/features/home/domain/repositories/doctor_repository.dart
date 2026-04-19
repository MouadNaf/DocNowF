import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/doctor.dart';

abstract class DoctorRepository {
  Future<Either<Failure, List<Doctor>>> getTopDoctors();
  Future<Either<Failure, List<Doctor>>> searchDoctors(String query);
}
