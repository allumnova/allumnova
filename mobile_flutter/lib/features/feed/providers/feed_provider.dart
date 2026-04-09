import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Feed Data Classes
class Post {
  final String id;
  final String content;
  final String postType;
  final Map<String, dynamic>? metadata;
  final List<dynamic>? media;
  final Map<String, dynamic>? author;
  final Map<String, dynamic> counts;
  final DateTime createdAt;

  Post({
    required this.id,
    required this.content,
    required this.postType,
    this.metadata,
    this.media,
    this.author,
    required this.counts,
    required this.createdAt,
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: json['id'],
      content: json['content'] ?? '',
      postType: json['post_type'] ?? 'general',
      metadata: json['metadata'],
      media: json['media'],
      author: json['author'],
      counts: json['_count'] ?? {},
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

// Feed Service
class FeedService {
  final ApiClient _apiClient;
  FeedService(this._apiClient);

  Future<List<Post>> fetchFeed({int page = 1, String? type}) async {
    try {
      final response = await _apiClient.get('/feed/college', queryParameters: {
        'page': page,
        if (type != null) 'type': type,
      });
      final List data = response.data['data'] ?? [];
      return data.map((p) => Post.fromJson(p)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> appreciate(String postId) async {
    await _apiClient.post('/feed/interact', data: {
      'postId': postId,
      'type': 'appreciate',
    });
  }
}

// Feed State Notifier
class FeedNotifier extends StateNotifier<AsyncValue<List<Post>>> {
  final FeedService _service;

  FeedNotifier(this._service) : super(const AsyncValue.loading()) {
    fetch();
  }

  Future<void> fetch() async {
    try {
      final posts = await _service.fetchFeed();
      state = AsyncValue.data(posts);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> toggleAppreciate(String postId) async {
    // Optimistic UI update would go here
    await _service.appreciate(postId);
  }
}

// Global Providers
final feedServiceProvider = Provider<FeedService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return FeedService(apiClient);
});

final feedProvider = StateNotifierProvider<FeedNotifier, AsyncValue<List<Post>>>((ref) {
  final service = ref.watch(feedServiceProvider);
  return FeedNotifier(service);
});
