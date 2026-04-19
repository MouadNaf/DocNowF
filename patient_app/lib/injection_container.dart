import 'package:get_it/get_it.dart';
import 'features/doctors/data/repositories/doctor_repository_impl.dart';
import 'features/doctors/data/datasources/doctor_remote_datasource.dart';
import 'features/doctors/data/datasources/doctor_local_datasource.dart';
import 'features/doctors/domain/repositories/doctor_repository.dart';
import 'features/doctors/domain/usecases/get_doctors.dart';
import 'features/doctors/domain/usecases/search_doctors.dart';
import 'features/doctors/presentation/bloc/doctor_bloc.dart';
import 'features/home/presentation/bloc/home_bloc.dart';
import 'features/search/presentation/bloc/search_bloc.dart';
import 'core/network/network_info.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // Network
  sl.registerLazySingleton<NetworkInfo>(() => NetworkInfoImpl());

  // Data Sources
  sl.registerLazySingleton<DoctorRemoteDataSource>(() => DoctorRemoteDataSourceImpl());
  sl.registerLazySingleton<DoctorLocalDataSource>(() => DoctorLocalDataSourceImpl());

  // Repository
  sl.registerLazySingleton<DoctorRepository>(() => DoctorRepositoryImpl(
    remoteDataSource: sl(),
    localDataSource: sl(),
    networkInfo: sl(),
  ));

  // Use Cases
  sl.registerLazySingleton(() => SearchDoctors(sl()));
  sl.registerLazySingleton(() => GetDoctors(sl()));

  // BLoC
  sl.registerFactory(() => DoctorBloc(
    getDoctors: sl(),
    searchDoctors: sl(),
  ));
  sl.registerFactory(() => HomeBloc());
  sl.registerFactory(() => SearchBloc());
}
