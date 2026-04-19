import 'package:dartz/dartz.dart';
import '../../../home/domain/entities/doctor.dart';
import '../../domain/repositories/doctor_repository.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/network_info.dart';
import '../datasources/doctor_local_datasource.dart';
import '../datasources/doctor_remote_datasource.dart';

class DoctorRepositoryImpl implements DoctorRepository {
  final DoctorRemoteDataSource remoteDataSource;
  final DoctorLocalDataSource localDataSource;
  final NetworkInfo networkInfo;

  DoctorRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, List<Doctor>>> getDoctors({
    String? specialty,
    String? sortBy,
    String? availability,
    String? priceRange,
    String? distance,
  }) async {
    if (await networkInfo.isConnected) {
      try {
        final remoteDoctors = await remoteDataSource.getDoctors(
          specialty: specialty,
          sortBy: sortBy,
          availability: availability,
          priceRange: priceRange,
          distance: distance,
        );
        await localDataSource.cacheDoctors(remoteDoctors);
        return Right(remoteDoctors);
      } on ServerException {
        return Left(ServerFailure('Server error occurred'));
      }
    } else {
      try {
        final localDoctors = await localDataSource.getCachedDoctors();
        return Right(localDoctors);
      } on CacheException {
        return Left(CacheFailure('No cached data available'));
      }
    }
  }

  @override
  Future<Either<Failure, Doctor>> getDoctorById(String id) async {
    if (await networkInfo.isConnected) {
      try {
        final remoteDoctor = await remoteDataSource.getDoctorById(id);
        return Right(remoteDoctor);
      } on ServerException {
        return Left(ServerFailure('Server error occurred'));
      }
    } else {
      try {
        final localDoctors = await localDataSource.getCachedDoctors();
        final doctor = localDoctors.firstWhere(
          (doc) => doc.id == id,
          orElse: () => throw CacheException('Doctor not found in cache'),
        );
        return Right(doctor);
      } on CacheException {
        return Left(CacheFailure('Doctor not found in cache'));
      }
    }
  }

  @override
  Future<Either<Failure, List<Doctor>>> searchDoctors(String query) async {
    if (await networkInfo.isConnected) {
      try {
        final remoteDoctors = await remoteDataSource.searchDoctors(query);
        return Right(remoteDoctors);
      } on ServerException {
        return Left(ServerFailure('Server error occurred'));
      }
    } else {
      try {
        final localDoctors = await localDataSource.getCachedDoctors();
        final filteredDoctors = localDoctors
            .where((doc) =>
                doc.name.toLowerCase().contains(query.toLowerCase()) ||
                doc.specialty.toLowerCase().contains(query.toLowerCase()))
            .toList();
        return Right(filteredDoctors);
      } on CacheException {
        return Left(CacheFailure('No cached data available'));
      }
    }
  }

  @override
  Future<Either<Failure, void>> addToFavorites(String doctorId) async {
    try {
      await localDataSource.addToFavorites(doctorId);
      return const Right(null);
    } on CacheException {
      return Left(CacheFailure('Failed to add to favorites'));
    }
  }

  @override
  Future<Either<Failure, void>> removeFromFavorites(String doctorId) async {
    try {
      await localDataSource.removeFromFavorites(doctorId);
      return const Right(null);
    } on CacheException {
      return Left(CacheFailure('Failed to remove from favorites'));
    }
  }

  @override
  Future<Either<Failure, List<Doctor>>> getFavoriteDoctors() async {
    try {
      final favoriteIds = await localDataSource.getFavoriteIds();
      final allDoctors = await localDataSource.getCachedDoctors();
      final favoriteDoctors = allDoctors
          .where((doc) => favoriteIds.contains(doc.id))
          .toList();
      return Right(favoriteDoctors);
    } on CacheException {
      return Left(CacheFailure('Failed to get favorite doctors'));
    }
  }
}
