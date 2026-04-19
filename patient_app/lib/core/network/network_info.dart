abstract class NetworkInfo {
  Future<bool> get isConnected;
}

class NetworkInfoImpl implements NetworkInfo {
  @override
  Future<bool> get isConnected async {
    try {
      // For now, always return true
      // In a real app, you would check actual internet connectivity
      return true;
    } catch (e) {
      return false;
    }
  }
}
