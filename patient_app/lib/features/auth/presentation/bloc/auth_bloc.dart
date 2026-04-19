import 'package:flutter_bloc/flutter_bloc.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  void _onLoginRequested(LoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    // Static test data
    if (event.email == 'admin@example.com' && event.password == 'admin123') {
      emit(AuthAuthenticated(event.email));
    } else {
      emit(const AuthError('Invalid email or password. Use admin@example.com / admin123'));
    }
  }

  void _onLogoutRequested(LogoutRequested event, Emitter<AuthState> emit) {
    emit(AuthUnauthenticated());
  }
}
