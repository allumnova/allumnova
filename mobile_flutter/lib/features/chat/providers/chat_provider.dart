import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Chat Data Classes
class Conversation {
  final String id;
  final Map<String, dynamic> participant;
  final String? lastMessage;
  final DateTime updatedAt;

  Conversation({
    required this.id,
    required this.participant,
    this.lastMessage,
    required this.updatedAt,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'],
      participant: json['participant'] ?? {},
      lastMessage: json['lastMessage'],
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}

class ChatMessage {
  final String id;
  final String content;
  final String senderId;
  final DateTime createdAt;
  final bool isOptimistic;

  ChatMessage({
    required this.id,
    required this.content,
    required this.senderId,
    required this.createdAt,
    this.isOptimistic = false,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'],
      content: json['content'] ?? '',
      senderId: json['senderId'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

// Chat Service
class ChatService {
  final ApiClient _apiClient;
  ChatService(this._apiClient);

  Future<List<Conversation>> fetchConversations() async {
    final response = await _apiClient.get('/chat/conversations');
    final List data = response.data['data'] ?? [];
    return data.map((c) => Conversation.fromJson(c)).toList();
  }

  Future<List<ChatMessage>> fetchMessages(String conversationId) async {
    final response = await _apiClient.get('/chat/messages/$conversationId');
    final List data = response.data['data'] ?? [];
    return data.map((m) => ChatMessage.fromJson(m)).toList();
  }

  Future<ChatMessage> sendMessage(String receiverId, String content) async {
    final response = await _apiClient.post('/chat/messages', data: {
      'receiverId': receiverId,
      'content': content,
    });
    return ChatMessage.fromJson(response.data['data']);
  }
}

// Chat Notifiers (Family for Messages)
class MessageNotifier extends StateNotifier<AsyncValue<List<ChatMessage>>> {
  final ChatService _service;
  final String _conversationId;

  MessageNotifier(this._service, this._conversationId) : super(const AsyncValue.loading()) {
    fetch();
  }

  Future<void> fetch() async {
    try {
      final messages = await _service.fetchMessages(_conversationId);
      state = AsyncValue.data(messages.reversed.toList());
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void addOptimisticMessage(String content, String senderId) {
    if (!state.hasValue) return;
    final newMessage = ChatMessage(
      id: 'opt_${DateTime.now().millisecondsSinceEpoch}',
      content: content,
      senderId: senderId,
      createdAt: DateTime.now(),
      isOptimistic: true,
    );
    state = AsyncValue.data([newMessage, ...state.value!]);
  }
}

// Global Providers
final chatServiceProvider = Provider<ChatService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ChatService(apiClient);
});

final conversationsProvider = FutureProvider<List<Conversation>>((ref) async {
  return ref.watch(chatServiceProvider).fetchConversations();
});

final messagesProvider = StateNotifierProvider.family<MessageNotifier, AsyncValue<List<ChatMessage>>, String>((ref, conversationId) {
  final service = ref.watch(chatServiceProvider);
  return MessageNotifier(service, conversationId);
});
