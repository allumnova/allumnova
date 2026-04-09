import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/foundation.dart';

class ApiClient {
  final Dio dio;
  final FlutterSecureStorage storage = const FlutterSecureStorage();

  ApiClient({required String baseUrl})
      : dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 15),
          headers: {
            'Content-Type': 'application/json',
          },
        )) {
    _initInterceptors();
  }

  void _initInterceptors() {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // 1. Fetch Token and College ID from Secure Storage
          final token = await storage.read(key: 'token');
          final collegeId = await storage.read(key: 'activeCollegeId');

          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          if (collegeId != null) {
            options.headers['X-College-ID'] = collegeId;
          }

          if (kDebugMode) {
            print('[API_REQUEST] ${options.method} ${options.uri}');
          }

          return handler.next(options);
        },
        onResponse: (response, handler) {
          if (kDebugMode) {
            print('[API_RESPONSE] ${response.statusCode} ${response.requestOptions.uri}');
          }
          return handler.next(response);
        },
        onError: (err, handler) async {
          if (kDebugMode) {
            print('[API_ERROR] ${err.response?.statusCode} ${err.requestOptions.uri}');
          }

          // 2. Handle Unauthorized/Expired Sessions
          if (err.response?.statusCode == 401 || err.response?.statusCode == 403) {
            final data = err.response?.data;
            final skipCodes = ['COLLEGE_UNVERIFIED', 'UNVERIFIED'];
            
            if (data is Map && skipCodes.contains(data['code'])) {
              return handler.next(err);
            }

            // Trigger global logout (to be handled by AuthProvider)
            await storage.deleteAll();
            // In a real app, we would use a Global Key or Stream to trigger navigation to Login
          }
          return handler.next(err);
        },
      ),
    );
  }

  // Generic Request Methods
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    return await dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) async {
    return await dio.post(path, data: data);
  }

  Future<Response> patch(String path, {dynamic data}) async {
    return await dio.patch(path, data: data);
  }

  Future<Response> delete(String path) async {
    return await dio.delete(path);
  }
}
