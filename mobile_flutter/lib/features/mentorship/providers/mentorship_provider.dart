import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Mentorship Data Class
class MentorshipRequest {
  final String id;
  final String message;
  final String status; // pending, accepted, declined
  final DateTime createdAt;
  final Map<String, dynamic>? student;
  final Map<String, dynamic>? alumni;

  MentorshipRequest({
    required this.id,
    required this.message,
    required this.status,
    required this.createdAt,
    this.student,
    this.alumni,
  });

  factory MentorshipRequest.fromJson(Map<String, dynamic> json) {
    return MentorshipRequest(
      id: json['id'],
      message: json['message'] ?? '',
      status: json['status'] ?? 'pending',
      createdAt: DateTime.parse(json['createdAt']),
      student: json['student'],
      alumni: json['alumni'],
    );
  }
}

// Mentorship Service
class MentorshipService {
  final ApiClient _apiClient;
  MentorshipService(this._apiClient);

  Future<List<MentorshipRequest>> fetchRequests() async {
    final response = await _apiClient.get('/mentorship/requests');
    final List data = response.data ?? [];
    return data.map((r) => MentorshipRequest.fromJson(r)).toList();
  }

  Future<void> updateStatus(String requestId, String status) async {
    await _apiClient.patch('/mentorship/status', data: {
      'requestId': requestId,
      'status': status,
    });
  }
}

// Mentorship Notifier
class MentorshipNotifier extends StateNotifier<AsyncValue<List<MentorshipRequest>>> {
  final MentorshipService _service;

  MentorshipNotifier(this._service) : super(const AsyncValue.loading()) {
    fetch();
  }

  Future<void> fetch() async {
    state = const AsyncValue.loading();
    try {
      final requests = await _service.fetchRequests();
      state = AsyncValue.data(requests);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> handleAction(String requestId, String status) async {
    await _service.updateStatus(requestId, status);
    fetch();
  }
}

// Global Providers
final mentorshipServiceProvider = Provider<MentorshipService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return MentorshipService(apiClient);
});

final mentorshipProvider = StateNotifierProvider<MentorshipNotifier, AsyncValue<List<MentorshipRequest>>>((ref) {
  final service = ref.watch(mentorshipServiceProvider);
  return MentorshipNotifier(service);
});
