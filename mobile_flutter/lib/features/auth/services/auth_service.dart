import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';

class AuthService {
  final ApiClient _apiClient;

  AuthService(this._apiClient);

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _apiClient.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchMe() async {
    try {
      final response = await _apiClient.get('/profile/me');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }
}
