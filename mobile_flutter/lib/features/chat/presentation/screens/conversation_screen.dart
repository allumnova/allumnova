import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/chat_provider.dart';
import 'package:intl/intl.dart';

class ConversationScreen extends ConsumerStatefulWidget {
  final String conversationId;
  final String participantName;
  final String participantId;

  const ConversationScreen({
    super.key,
    required this.conversationId,
    required this.participantName,
    required this.participantId,
  });

  @override
  ConsumerState<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends ConsumerState<ConversationScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  Future<void> _sendMessage() async {
    final content = _messageController.text.trim();
    if (content.isEmpty) return;

    final currentUser = ref.read(authProvider).user;
    if (currentUser == null) return;

    // 1. Optimistic Update
    ref.read(messagesProvider(widget.conversationId).notifier)
       .addOptimisticMessage(content, currentUser.id);

    _messageController.clear();
    _scrollToBottom();

    // 2. Real API Call
    try {
      await ref.read(chatServiceProvider).sendMessage(widget.participantId, content);
      // Success - Refresh to sync real IDs
      ref.refresh(messagesProvider(widget.conversationId));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to send signal. Retrying...'), backgroundColor: Colors.roseAccent),
      );
    }
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final messagesState = ref.watch(messagesProvider(widget.conversationId));
    final currentUser = ref.watch(authProvider).user;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.background.withOpacity(0.8),
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.primary.withOpacity(0.1),
              ),
              child: Center(child: Text(widget.participantName[0], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
            ),
            const SizedBox(width: 12),
            Text(widget.participantName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
      body: Column(
        children: [
          // Messages List
          Expanded(
            child: messagesState.when(
              loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
              error: (e, st) => Center(child: Text('Error: $e')),
              data: (messages) => ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(20),
                reverse: true,
                itemCount: messages.length,
                itemBuilder: (context, index) {
                  final message = messages[index];
                  final isMe = message.senderId == currentUser?.id;
                  return _MessageBubble(message: message, isMe: isMe);
                },
              ),
            ),
          ),

          // Input Bar
          _ChatInputBar(
            controller: _messageController,
            onSend: _sendMessage,
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final ChatMessage message;
  final bool isMe;

  const _MessageBubble({required this.message, required this.isMe});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isMe ? AppTheme.primary : AppTheme.surface.withOpacity(0.5),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: Radius.circular(isMe ? 20 : 4),
            bottomRight: Radius.circular(isMe ? 4 : 20),
          ),
          border: isMe ? null : Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              message.content,
              style: TextStyle(
                fontSize: 14,
                color: isMe ? Colors.white : Colors.white70,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  DateFormat.jm().format(message.createdAt),
                  style: TextStyle(
                    fontSize: 8,
                    color: isMe ? Colors.white60 : AppTheme.textSecondary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (message.isOptimistic) ...[
                  const SizedBox(width: 4),
                  const Icon(LucideIcons.clock, size: 8, color: Colors.white60),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ChatInputBar extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSend;

  const _ChatInputBar({required this.controller, required this.onSend});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      color: AppTheme.background,
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: TextField(
                  controller: controller,
                  style: const TextStyle(fontSize: 14),
                  decoration: const InputDecoration(
                    hintText: 'Exchange high-signal insights...',
                    hintStyle: TextStyle(color: Colors.white24, fontSize: 13),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 16),
                  ),
                  onSubmitted: (_) => onSend(),
                ),
              ),
            ),
            const SizedBox(width: 12),
            GestureDetector(
              onTap: onSend,
              child: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primary.withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(LucideIcons.send, color: Colors.white, size: 18),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
