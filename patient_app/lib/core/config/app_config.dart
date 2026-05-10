class AppConfig {
  // Override with:
  // flutter run --dart-define=API_BASE_URL=http://192.168.1.X:8000/api
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.231.61.142:8000/api',
  );
}
