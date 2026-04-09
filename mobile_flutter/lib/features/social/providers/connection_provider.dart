import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Connection Request Model
class ConnectionRequest {
  final String id;
  final String status;
  final DateTime createdAt;
  final Map<String, dynamic> user;

  ConnectionRequest({
    required this.id,
    required this.status,
    required this.createdAt,
    required this.user,
  });

  factory ConnectionRequest.fromJson(Map<String, dynamic> json) {
    return ConnectionRequest(
      id: json['id'],
      status: json['status'] ?? 'pending',
      createdAt: DateTime.parse(json['createdAt']),
      user: json['user'] ?? {},
    );
  }
}

// Connection Service
class ConnectionService {
  final ApiClient _apiClient;
  ConnectionService(this._apiClient);

  Future<Map<String, List<ConnectionRequest>>> fetchPending() async {
    final response = await _apiClient.get('/social/connect/pending');
    final incoming = (response.data['incoming'] as List? ?? [])
        .map((r) => ConnectionRequest.fromJson(r)).toList();
    final outgoing = (response.data['outgoing'] as List? ?? [])
        .map((r) => ConnectionRequest.fromJson(r)).toList();
    return {'incoming': incoming, 'outgoing': outgoing};
  }

  Future<List<dynamic>> fetchConnections() async {
    final response = await _apiClient.get('/social/connections');
    return response.data ?? [];
  }

  Future<List<dynamic>> fetchDiscover() async {
    final response = await _apiClient.get('/social/discover');
    return response.data ?? [];
  }

  Future<void> sendRequest(String receiverId) async {
    await _apiClient.post('/social/connect', data: {'receiverId': receiverId});
  }

  Future<void> acceptRequest(String requestId) async {
    await _apiClient.post('/social/connect/accept', data: {'requestId': requestId});
  }

  Future<void> declineRequest(String requestId) async {
    await _apiClient.post('/social/connect/decline', data: {'requestId': requestId});
  }

  Future<void> removeConnection(String userId) async {
    await _apiClient.delete('/social/connections/$userId');
  }
}

// Global Providers
final connectionServiceProvider = Provider<ConnectionService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ConnectionService(apiClient);
});

// State Providers for separate tabs
final pendingRequestsProvider = FutureProvider<Map<String, List<ConnectionRequest>>>((ref) async {
  return ref.watch(connectionServiceProvider).fetchPending();
});

final activeConnectionsProvider = FutureProvider<List<dynamic>>((ref) async {
  return ref.watch(connectionServiceProvider).fetchConnections();
});

final discoverPeersProvider = FutureProvider<List<dynamic>>((ref) async {
  return ref.watch(connectionServiceProvider).fetchDiscover();
});
