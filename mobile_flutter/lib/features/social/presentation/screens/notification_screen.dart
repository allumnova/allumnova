import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/connection_provider.dart';

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // In a real system, we'd have a NotificationProvider. 
    // For now, we reuse the connection request data to demonstrate the "Signals Inbox"
    final pendingState = ref.watch(pendingRequestsProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.background,
        elevation: 0,
        title: const Text('SIGNALS INBOX', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 2)),
        actions: [
          TextButton(
            onPressed: () {},
            child: const Text('MARK READ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.primary)),
          ),
        ],
      ),
      body: pendingState.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
        error: (e, st) => Center(child: Text('Error: $e')),
        data: (data) {
          final incoming = data['incoming'] ?? [];
          
          if (incoming.isEmpty) {
            return const _EmptyNotifications();
          }

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: incoming.length,
            itemBuilder: (context, index) {
              final req = incoming[index];
              return _NotificationCard(
                type: 'connect',
                user: req.user['name'] ?? 'Innovator',
                content: 'sent you a connection signal.',
                time: 'JUST NOW',
                onAccept: () => ref.read(connectionServiceProvider).acceptRequest(req.id).then((_) => ref.refresh(pendingRequestsProvider)),
                onDecline: () => ref.read(connectionServiceProvider).declineRequest(req.id).then((_) => ref.refresh(pendingRequestsProvider)),
              );
            },
          );
        },
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  final String type;
  final String user;
  final String content;
  final String time;
  final VoidCallback? onAccept;
  final VoidCallback? onDecline;

  const _NotificationCard({
    required this.type,
    required this.user,
    required this.content,
    required this.time,
    this.onAccept,
    this.onDecline,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _IconBox(type: type),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(user, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                        Text(time, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.white24)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(content, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                  ],
                ),
              ),
            ],
          ),
          if (type == 'connect' && onAccept != null) ...[
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: onAccept,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('ACCEPT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: onDecline,
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: Colors.white.withOpacity(0.1)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('DECLINE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white70)),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _IconBox extends StatelessWidget {
  final String type;
  const _IconBox({required this.type});

  @override
  Widget build(BuildContext context) {
    IconData icon;
    Color color;

    switch (type) {
      case 'connect':
        icon = LucideIcons.userPlus;
        color = Colors.blueAccent;
        break;
      case 'opportunity':
        icon = LucideIcons.rocket;
        color = Colors.amberAccent;
        break;
      case 'appreciate':
        icon = LucideIcons.heart;
        color = Colors.roseAccent;
        break;
      default:
        icon = LucideIcons.bell;
        color = AppTheme.primary;
    }

    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Icon(icon, color: color, size: 20),
    );
  }
}

class _EmptyNotifications extends StatelessWidget {
  const _EmptyNotifications();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppTheme.primary.withOpacity(0.05),
              shape: BoxShape.circle,
            ),
            child: const Icon(LucideIcons.bellOff, size: 48, color: Colors.white12),
          ),
          const SizedBox(height: 24),
          const Text('VITAL SIGNALS CLEAR', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white70, letterSpacing: 2)),
          const SizedBox(height: 8),
          const Text('No pending notifications at the moment.', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
        ],
      ),
    );
  }
}
