import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/doctor.dart';
import '../repositories/doctor_repository.dart';

class GetTopDoctors {
  final DoctorRepository repository;

  GetTopDoctors(this.repository);

  Future<Either<Failure, List<Doctor>>> call() async {
    return await repository.getTopDoctors();
  }
}

class SearchDoctors {
  final DoctorRepository repository;

  SearchDoctors(this.repository);

  Future<Either<Failure, List<Doctor>>> call(String query) async {
    return await repository.searchDoctors(query);
  }
}
