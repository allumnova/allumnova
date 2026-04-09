import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Hub Data Classes
class Hub {
  final String id;
  final String name;
  final String? description;
  final String tier; // SOCIETY, PUBLIC
  final int memberCount;
  final String? avatar;
  final bool isMember;
  final String? userStatus; // pending, member, none

  Hub({
    required this.id,
    required this.name,
    this.description,
    required this.tier,
    required this.memberCount,
    this.avatar,
    required this.isMember,
    this.userStatus,
  });

  factory Hub.fromJson(Map<String, dynamic> json) {
    return Hub(
      id: json['id'],
      name: json['name'] ?? 'Hub',
      description: json['description'],
      tier: json['tier'] ?? 'PUBLIC',
      memberCount: json['memberCount'] ?? 0,
      avatar: json['avatar'],
      isMember: json['isMember'] ?? false,
      userStatus: json['userStatus'],
    );
  }
}

// Hub Service
class HubService {
  final ApiClient _apiClient;
  HubService(this._apiClient);

  Future<List<Hub>> fetchHubs({String? category}) async {
    final response = await _apiClient.get('/social/environments', queryParameters: {
      if (category != null) 'category': category,
    });
    final List data = response.data['data'] ?? [];
    return data.map((h) => Hub.fromJson(h)).toList();
  }

  Future<void> joinHub(String hubId, {String? reason}) async {
    await _apiClient.post('/social/hubs/join', data: {
      'hubId': hubId,
      if (reason != null) 'reason': reason,
    });
  }
}

// Hub State Notifier
class HubNotifier extends StateNotifier<AsyncValue<List<Hub>>> {
  final HubService _service;

  HubNotifier(this._service) : super(const AsyncValue.loading()) {
    fetch();
  }

  Future<void> fetch() async {
    state = const AsyncValue.loading();
    try {
      final hubs = await _service.fetchHubs();
      state = AsyncValue.data(hubs);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

// Global Providers
final hubServiceProvider = Provider<HubService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return HubService(apiClient);
});

final hubsProvider = StateNotifierProvider<HubNotifier, AsyncValue<List<Hub>>>((ref) {
  final service = ref.watch(hubServiceProvider);
  return HubNotifier(service);
});
