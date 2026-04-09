import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/mentorship_provider.dart';
import 'package:intl/intl.dart';

class MentorshipDashboard extends ConsumerWidget {
  const MentorshipDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mentorshipState = ref.watch(mentorshipProvider);
    final currentUser = ref.watch(authProvider).user;
    final isAlumni = currentUser?.role == 'alumni';

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.background.withOpacity(0.8),
        elevation: 0,
        title: Text(
          isAlumni ? 'MENTORSHIP DASHBOARD' : 'YOUR MENTORS',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 2),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(mentorshipProvider.notifier).fetch(),
        color: AppTheme.primary,
        child: Column(
          children: [
            // Sub-header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Text(
                isAlumni 
                  ? 'Manage incoming requests from students seeking professional blueprinting.' 
                  : 'Track your requests to connect with elite alumni for career mentorship.',
                style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.5),
              ),
            ),

            // Request List
            Expanded(
              child: mentorshipState.when(
                loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
                error: (e, st) => Center(child: Text('Error: $e')),
                data: (requests) => requests.isEmpty 
                  ? const _EmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.all(20),
                      itemCount: requests.length,
                      itemBuilder: (context, index) => _RequestCard(
                        request: requests[index],
                        isAlumni: isAlumni,
                        onAction: (status) => ref.read(mentorshipProvider.notifier).handleAction(requests[index].id, status),
                      ),
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RequestCard extends StatelessWidget {
  final MentorshipRequest request;
  final bool isAlumni;
  final Function(String) onAction;

  const _RequestCard({
    required this.request,
    required this.isAlumni,
    required this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final partner = isAlumni ? request.student : request.alumni;
    final partnerName = partner?['name'] ?? 'Innovator';
    final partnerAvatar = partner?['avatar'];

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.surface.withOpacity(0.5),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  image: partnerAvatar != null ? DecorationImage(image: NetworkImage(partnerAvatar), fit: BoxFit.cover) : null,
                  color: AppTheme.primary.withOpacity(0.1),
                ),
                child: partnerAvatar == null ? Center(child: Text(partnerName[0])) : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(partnerName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text(
                      DateFormat.yMMMd().format(request.createdAt).toUpperCase(),
                      style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: AppTheme.textSecondary, letterSpacing: 1),
                    ),
                  ],
                ),
              ),
              _StatusBadge(status: request.status),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.02),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
            ),
            child: Text(
              '"${request.message}"',
              style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: Colors.white70, height: 1.5),
            ),
          ),
          if (isAlumni && request.status == 'pending') ...[
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _ActionButton(
                    label: 'ACCEPT',
                    color: Colors.blueAccent,
                    onPressed: () => onAction('accepted'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _ActionButton(
                    label: 'DECLINE',
                    color: Colors.white10,
                    onPressed: () => onAction('declined'),
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

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final color = status == 'accepted' ? Colors.emerald : (status == 'declined' ? Colors.rose : Colors.amber);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: color, letterSpacing: 1),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback onPressed;

  const _ActionButton({required this.label, required this.color, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 0,
      ),
      child: Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(32),
            ),
            child: const Icon(LucideIcons.award, size: 48, color: Colors.white12),
          ),
          const SizedBox(height: 24),
          const Text('NO MENTORSHIP TRACKS YET', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 1, color: AppTheme.textSecondary)),
        ],
      ),
    );
  }
}
