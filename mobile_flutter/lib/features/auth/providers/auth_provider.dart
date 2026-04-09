import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/auth_service.dart';
import '../../../core/network/api_client.dart';

class AuthState {
  final Map<String, dynamic>? user;
  final String? token;
  final bool isAuthenticated;
  final bool loading;

  AuthState({
    this.user,
    this.token,
    this.isAuthenticated = false,
    this.loading = true,
  });

  AuthState copyWith({
    Map<String, dynamic>? user,
    String? token,
    bool? isAuthenticated,
    bool? loading,
  }) {
    return AuthState(
      user: user ?? this.user,
      token: token ?? this.token,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      loading: loading ?? this.loading,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  AuthNotifier(this._authService) : super(AuthState()) {
    _init();
  }

  Future<void> _init() async {
    final token = await _storage.read(key: 'token');
    // In a real app, we would also store the user JSON
    if (token != null) {
      try {
        final res = await _authService.fetchMe();
        if (res['success'] == true) {
          state = AuthState(
            token: token,
            user: res['data'],
            isAuthenticated: true,
            loading: false,
          );
          return;
        }
      } catch (e) {
        await logout();
      }
    }
    state = state.copyWith(loading: false);
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(loading: true);
    try {
      final res = await _authService.login(email, password);
      final token = res['token'];
      final user = res['user'];

      await _storage.write(key: 'token', token);
      
      state = AuthState(
        token: token,
        user: user,
        isAuthenticated: true,
        loading: false,
      );
      return true;
    } catch (e) {
      state = state.copyWith(loading: false);
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.deleteAll();
    state = AuthState(loading: false);
  }
}

// Global Providers
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(baseUrl: 'http://localhost:5000/api'); // Update for production
});

final authServiceProvider = Provider<AuthService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthService(apiClient);
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});
