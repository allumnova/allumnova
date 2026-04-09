import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/hub_provider.dart';

class DiscoverHubsScreen extends ConsumerWidget {
  const DiscoverHubsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hubsState = ref.watch(hubsProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.background.withOpacity(0.8),
        elevation: 0,
        title: const Text('DISCOVER HUBS', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 2)),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(20),
            child: Container(
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: const TextField(
                style: TextStyle(fontSize: 14),
                decoration: InputDecoration(
                  icon: Icon(LucideIcons.search, size: 18, color: AppTheme.textSecondary),
                  hintText: 'Find societies & public labs...',
                  hintStyle: TextStyle(color: Colors.white24, fontSize: 13),
                  border: InputBorder.none,
                ),
              ),
            ),
          ),

          // Hub List
          Expanded(
            child: hubsState.when(
              loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
              error: (e, st) => Center(child: Text('Error: $e')),
              data: (hubs) => ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: hubs.length,
                itemBuilder: (context, index) => _HubCard(hub: hubs[index]),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HubCard extends StatelessWidget {
  final Hub hub;
  const _HubCard({required this.hub});

  @override
  Widget build(BuildContext context) {
    final isSociety = hub.tier == 'SOCIETY';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.surface.withOpacity(0.5),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: isSociety ? Colors.purple.withOpacity(0.1) : Colors.emerald.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(
              isSociety ? LucideIcons.shieldCheck : LucideIcons.globe,
              color: isSociety ? Colors.purpleAccent : Colors.emeraldAccent,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(hub.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(width: 8),
                    _TierBadge(tier: hub.tier),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${hub.memberCount} MEMBERS',
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.textSecondary, letterSpacing: 1),
                ),
              ],
            ),
          ),
          _JoinActionButton(hub: hub),
        ],
      ),
    );
  }
}

class _TierBadge extends StatelessWidget {
  final String tier;
  const _TierBadge({required this.tier});

  @override
  Widget build(BuildContext context) {
    final isSociety = tier == 'SOCIETY';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: (isSociety ? Colors.purple : Colors.emerald).withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: (isSociety ? Colors.purple : Colors.emerald).withOpacity(0.2)),
      ),
      child: Text(
        tier,
        style: TextStyle(
          fontSize: 7,
          fontWeight: FontWeight.w900,
          color: isSociety ? Colors.purpleAccent : Colors.emeraldAccent,
        ),
      ),
    );
  }
}

class _JoinActionButton extends StatelessWidget {
  final Hub hub;
  const _JoinActionButton({required this.hub});

  @override
  Widget build(BuildContext context) {
    if (hub.isMember) {
      return const Icon(LucideIcons.checkCircle2, color: Colors.emerald, size: 20);
    }

    if (hub.userStatus == 'pending') {
      return const Text('PENDING', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.blueAccent));
    }

    return ElevatedButton(
      onPressed: () {},
      style: ElevatedButton.styleFrom(
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        minimumSize: Size.zero,
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 0,
      ),
      child: Text(
        hub.tier == 'SOCIETY' ? 'APPLY' : 'JOIN',
        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
      ),
    );
  }
}
