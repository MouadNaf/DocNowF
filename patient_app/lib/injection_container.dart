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
import 'features/chatbot/data/chat_service.dart';

import 'features/appointments/domain/repositories/appointment_repository.dart';
import 'features/appointments/data/repositories/appointment_repository_impl.dart';
import 'features/appointments/domain/usecases/book_appointment.dart';
import 'features/appointments/domain/usecases/get_available_slots.dart';
import 'features/appointments/presentation/bloc/appointment_bloc.dart';
import 'features/appointments/domain/usecases/get_patient_appointments.dart';
import 'features/appointments/domain/usecases/cancel_appointment.dart';
import 'features/appointments/presentation/bloc/patient_appointments_bloc.dart';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

import 'core/network/api_client.dart';
import 'features/auth/domain/repositories/auth_repository.dart';
import 'features/auth/data/repositories/auth_repository_impl.dart';
import 'features/auth/data/datasources/auth_remote_data_source.dart';
import 'features/auth/data/datasources/auth_local_data_source.dart';
import 'features/auth/domain/usecases/login_usecase.dart';
import 'features/auth/domain/usecases/register_usecase.dart';
import 'features/auth/domain/usecases/logout_usecase.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // External
  final sharedPreferences = await SharedPreferences.getInstance();
  sl.registerLazySingleton(() => sharedPreferences);
  sl.registerLazySingleton(() => http.Client());

  // Network
  sl.registerLazySingleton<NetworkInfo>(() => NetworkInfoImpl());
  sl.registerLazySingleton(() => ApiClient(
    client: sl(),
    localDataSource: sl(),
  ));

  // Data Sources
  sl.registerLazySingleton<DoctorRemoteDataSource>(
    () => DoctorRemoteDataSourceImpl(apiClient: sl()),
  );
  sl.registerLazySingleton<DoctorLocalDataSource>(() => DoctorLocalDataSourceImpl());
  
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(apiClient: sl()),
  );
  sl.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(sharedPreferences: sl()),
  );

  // Repository
  sl.registerLazySingleton<DoctorRepository>(() => DoctorRepositoryImpl(
    remoteDataSource: sl(),
    localDataSource: sl(),
    networkInfo: sl(),
  ));
  sl.registerLazySingleton<AppointmentRepository>(() => AppointmentRepositoryImpl(apiClient: sl()));
  sl.registerLazySingleton<AuthRepository>(() => AuthRepositoryImpl(
    remoteDataSource: sl(),
    localDataSource: sl(),
  ));

  // Use Cases
  sl.registerLazySingleton(() => SearchDoctors(sl()));
  sl.registerLazySingleton(() => GetDoctors(sl()));
  sl.registerLazySingleton(() => BookAppointment(sl()));
  sl.registerLazySingleton(() => GetAvailableSlots(sl()));
  sl.registerLazySingleton(() => GetPatientAppointments(sl()));
  sl.registerLazySingleton(() => CancelAppointment(sl()));
  sl.registerLazySingleton(() => LoginUseCase(sl()));
  sl.registerLazySingleton(() => RegisterUseCase(sl()));
  sl.registerLazySingleton(() => LogoutUseCase(sl()));

  // BLoC
  sl.registerFactory(() => DoctorBloc(
    getDoctors: sl(),
    searchDoctors: sl(),
  ));
  sl.registerFactory(() => HomeBloc(getDoctors: sl()));
  sl.registerFactory(() => SearchBloc());
  sl.registerFactory(() => AppointmentBloc(
    bookAppointmentUseCase: sl(),
    getAvailableSlotsUseCase: sl(),
  ));
  sl.registerFactory(() => PatientAppointmentsBloc(
    getPatientAppointmentsUseCase: sl(),
    cancelAppointmentUseCase: sl(),
  ));
  sl.registerFactory(() => AuthBloc(
    loginUseCase: sl(),
    registerUseCase: sl(),
    logoutUseCase: sl(),
  ));

  // Chatbot
  sl.registerLazySingleton(() => ChatService(apiClient: sl()));
}
