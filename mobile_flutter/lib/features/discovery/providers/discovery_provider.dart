import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';

// Discovery Data Classes
class DiscoveryBrief {
  final String briefing;
  final List<dynamic> peers;
  final List<dynamic> societies;
  final List<dynamic> projects;

  DiscoveryBrief({
    required this.briefing,
    required this.peers,
    required this.societies,
    required this.projects,
  });

  factory DiscoveryBrief.fromJson(Map<String, dynamic> json) {
    return DiscoveryBrief(
      briefing: json['briefing'] ?? 'Gathering signal data...',
      peers: json['peers'] ?? [],
      societies: json['societies'] ?? [],
      projects: json['projects'] ?? [],
    );
  }
}

// Discovery Service
class DiscoveryService {
  final ApiClient _apiClient;
  DiscoveryService(this._apiClient);

  Future<DiscoveryBrief> fetchBrief() async {
    try {
      final response = await _apiClient.get('/social/discovery-brief');
      return DiscoveryBrief.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
}

// Discovery State Notifier
class DiscoveryNotifier extends StateNotifier<AsyncValue<DiscoveryBrief>> {
  final DiscoveryService _service;

  DiscoveryNotifier(this._service) : super(const AsyncValue.loading()) {
    fetch();
  }

  Future<void> fetch() async {
    state = const AsyncValue.loading();
    try {
      final brief = await _service.fetchBrief();
      state = AsyncValue.data(brief);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

// Global Providers
final discoveryServiceProvider = Provider<DiscoveryService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return DiscoveryService(apiClient);
});

final discoveryProvider = StateNotifierProvider<DiscoveryNotifier, AsyncValue<DiscoveryBrief>>((ref) {
  final service = ref.watch(discoveryServiceProvider);
  return DiscoveryNotifier(service);
});
