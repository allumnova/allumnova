import 'dart:io';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Onboarding Service
class OnboardingService {
  final ApiClient _apiClient;
  OnboardingService(this._apiClient);

  Future<void> submitOnboarding({
    required String name,
    required String username,
    required String phone,
    required String linkedIn,
    required String collegeId,
    required String role,
    required String batch,
    required File document,
  }) async {
    final formData = FormData.fromMap({
      'name': name,
      'username': username,
      'phone': phone,
      'linkedIn': linkedIn,
      'collegeId': collegeId,
      'role': role,
      'batch': batch,
      'document': await MultipartFile.fromFile(document.path),
    });

    await _apiClient.post(
      '/profile/onboarding',
      data: formData,
      options: Options(headers: {'Content-Type': 'multipart/form-data'}),
    );
  }

  Future<bool> checkUsername(String username) async {
    final response = await _apiClient.get('/profile/check-username', queryParameters: {'username': username});
    return response.data['data']['available'] ?? false;
  }
}

// Onboarding Provider
final onboardingServiceProvider = Provider<OnboardingService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return OnboardingService(apiClient);
});
