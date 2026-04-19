import 'package:dartz/dartz.dart';
import '../../../home/domain/entities/doctor.dart';
import '../repositories/doctor_repository.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';

class GetDoctors implements UseCase<List<Doctor>, GetDoctorsParams> {
  final DoctorRepository repository;

  GetDoctors(this.repository);

  @override
  Future<Either<Failure, List<Doctor>>> call(GetDoctorsParams params) {
    return repository.getDoctors(
      specialty: params.specialty,
      sortBy: params.sortBy,
      availability: params.availability,
      priceRange: params.priceRange,
      distance: params.distance,
    );
  }
}

class GetDoctorsParams {
  final String? specialty;
  final String? sortBy;
  final String? availability;
  final String? priceRange;
  final String? distance;

  GetDoctorsParams({
    this.specialty,
    this.sortBy,
    this.availability,
    this.priceRange,
    this.distance,
  });
}
