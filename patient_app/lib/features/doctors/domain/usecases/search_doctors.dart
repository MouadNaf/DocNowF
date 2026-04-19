import 'package:dartz/dartz.dart';
import '../../../home/domain/entities/doctor.dart';
import '../repositories/doctor_repository.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';

class SearchDoctors implements UseCase<List<Doctor>, String> {
  final DoctorRepository repository;

  SearchDoctors(this.repository);

  @override
  Future<Either<Failure, List<Doctor>>> call(String query) {
    return repository.searchDoctors(query);
  }
}
