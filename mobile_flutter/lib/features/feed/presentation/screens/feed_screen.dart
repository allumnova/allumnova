import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../discovery/presentation/widgets/discovery_hub.dart';
import '../providers/feed_provider.dart';
import '../widgets/post_card.dart';

class FeedScreen extends ConsumerWidget {
  const FeedScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final feedState = ref.watch(feedProvider);

    return Scaffold(
      extendBody: true,
      appBar: AppBar(
        backgroundColor: AppTheme.background.withOpacity(0.8),
        elevation: 0,
        title: Row(
          children: [
            const Icon(LucideIcons.rocket, color: AppTheme.primary, size: 24),
            const SizedBox(width: 12),
            Text(
              'ALLUMNOVA',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                letterSpacing: 2,
                color: Colors.white,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.bell, color: Colors.white),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(feedProvider.notifier).fetch(),
        color: AppTheme.primary,
        backgroundColor: AppTheme.surface,
        child: CustomScrollView(
          slivers: [
            // 1. Discovery Hub (Research Agent)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.only(top: 8),
                child: DiscoveryHub(),
              ),
            ),

            // 2. Feed Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Row(
                  children: [
                    const Icon(LucideIcons.zap, color: Colors.blue, size: 16),
                    const SizedBox(width: 8),
                    const Text(
                      'COMMUNITY PULSE',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // 3. Feed Posts
            feedState.when(
              loading: () => const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator(color: AppTheme.primary)),
              ),
              error: (err, st) => SliverFillRemaining(
                child: Center(child: Text('Failed to load feed: $err')),
              ),
              data: (posts) => SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => PostCard(post: posts[index]),
                    childCount: posts.length,
                  ),
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
      bottomNavigationBar: const _GlassBottomNav(),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: AppTheme.primary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: const Icon(LucideIcons.plus, color: Colors.white),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }
}

class _GlassBottomNav extends StatelessWidget {
  const _GlassBottomNav();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(20),
      height: 72,
      child: GlassContainer(
        borderRadius: BorderRadius.circular(32),
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _NavItem(icon: LucideIcons.layoutGrid, isActive: true),
            _NavItem(icon: LucideIcons.search, isActive: false),
            const SizedBox(width: 48), // Space for FAB
            _NavItem(icon: LucideIcons.messageSquare, isActive: false),
            _NavItem(icon: LucideIcons.user, isActive: false),
          ],
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final bool isActive;
  const _NavItem({required this.icon, required this.isActive});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: isActive ? BoxDecoration(
        color: AppTheme.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ) : null,
      child: Icon(
        icon,
        color: isActive ? AppTheme.primary : AppTheme.textSecondary,
        size: 24,
      ),
    );
  }
}
