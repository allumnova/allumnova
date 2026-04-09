import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../feed/presentation/widgets/post_card.dart';
import '../providers/profile_provider.dart';
import '../widgets/reputation_pulsar.dart';
import 'portfolio_screen.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  final String userId;
  const ProfileScreen({super.key, required this.userId});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileProvider(widget.userId));

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.moreHorizontal, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: profileState.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
        error: (e, st) => Center(child: Text('Error: $e')),
        data: (profile) => SingleChildScrollView(
          child: Column(
            children: [
              // Header Segment
              _ProfileHeader(profile: profile),
              
              // Stats Segment
              _ProfileStats(profile: profile),
              const SizedBox(height: 24),

              // Tabs Segment
              _ProfileTabs(tabController: _tabController),
              
              // Tab Content
              SizedBox(
                height: 800, // Reasonable height for scrollable content
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    // Feed Tab
                    _ProfileFeedTab(posts: profile.posts ?? []),
                    // Projects Tab
                    _ProfileProjectsTab(projects: profile.projects ?? []),
                    // About Tab
                    _ProfileAboutTab(profile: profile),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  final UserProfile profile;
  const _ProfileHeader({required this.profile});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.only(top: 100, bottom: 40),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppTheme.primary.withOpacity(0.2),
            AppTheme.background,
          ],
        ),
      ),
      child: Column(
        children: [
          ReputationPulsar(
            score: profile.reputationScore ?? 0,
            tier: profile.tierLevel ?? 'Echo',
          ),
          const SizedBox(height: 24),
          Text(
            profile.name,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              letterSpacing: -1,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${profile.department ?? "Institutional Member"} • ${profile.role?.toUpperCase() ?? "MEMBER"}',
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: AppTheme.textSecondary,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _HeaderAction(
                label: 'CONNECT',
                icon: LucideIcons.userPlus,
                onPressed: () {},
                isPrimary: true,
              ),
              const SizedBox(width: 12),
              _HeaderAction(
                label: 'PORTFOLIO',
                icon: LucideIcons.layers,
                onPressed: () {
                  if (profile.username != null) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => PortfolioScreen(username: profile.username!)),
                    );
                  }
                },
                isPrimary: false,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProfileStats extends StatelessWidget {
  final UserProfile profile;
  const _ProfileStats({required this.profile});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _StatItem(label: 'IMPACT', value: profile.reputationScore.toString(), color: Colors.blueAccent),
          _StatItem(label: 'POSTS', value: (profile.posts?.length ?? 0).toString(), color: Colors.purpleAccent),
          _StatItem(label: 'RECORDS', value: (profile.projects?.length ?? 0).toString(), color: Colors.emeraldAccent),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _StatItem({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        margin: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(
          color: AppTheme.surface.withOpacity(0.5),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 8,
                fontWeight: FontWeight.w900,
                color: color,
                letterSpacing: 1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileTabs extends StatelessWidget {
  final TabController tabController;
  const _ProfileTabs({required this.tabController});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(20),
      ),
      child: TabBar(
        controller: tabController,
        indicator: BoxDecoration(
          color: Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
        ),
        labelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
        unselectedLabelColor: AppTheme.textSecondary,
        tabs: const [
          Tab(text: 'FEED'),
          Tab(text: 'PROJECTS'),
          Tab(text: 'ABOUT'),
        ],
      ),
    );
  }
}

class _ProfileFeedTab extends StatelessWidget {
  final List<dynamic> posts;
  const _ProfileFeedTab({required this.posts});

  @override
  Widget build(BuildContext context) {
    if (posts.isEmpty) {
      return const Center(child: Text('NO ACTIVITY YET', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      physics: const NeverScrollableScrollPhysics(),
      itemCount: posts.length,
      itemBuilder: (context, index) => PostCard(post: posts[index]),
    );
  }
}

class _ProfileProjectsTab extends StatelessWidget {
  final List<dynamic> projects;
  const _ProfileProjectsTab({required this.projects});

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('PROJECT CARDS HERE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)));
  }
}

class _ProfileAboutTab extends StatelessWidget {
  final UserProfile profile;
  const _ProfileAboutTab({required this.profile});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('CAREER OBJECTIVE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.primary, letterSpacing: 2)),
          const SizedBox(height: 12),
          Text(
            profile.careerObjective ?? 'Crafting institutional innovation at Allumnova.',
            style: const TextStyle(fontSize: 14, height: 1.6, fontStyle: FontStyle.italic, color: Colors.white70),
          ),
          const SizedBox(height: 32),
          const Text('MEMBER DETAILS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.primary, letterSpacing: 2)),
          const SizedBox(height: 12),
          _AboutItem(label: 'Institution Role', value: profile.role?.toUpperCase() ?? 'STUDENT'),
          _AboutItem(label: 'Engagement Score', value: profile.reputationScore.toString()),
          _AboutItem(label: 'Direct Connection', value: profile.linkedIn ?? 'Unlinked'),
        ],
      ),
    );
  }
}

class _AboutItem extends StatelessWidget {
  final String label;
  final String value;
  const _AboutItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 8, color: AppTheme.textSecondary, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _HeaderAction extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onPressed;
  final bool isPrimary;

  const _HeaderAction({
    required this.label,
    required this.icon,
    required this.onPressed,
    required this.isPrimary,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          color: isPrimary ? AppTheme.primary : AppTheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: isPrimary ? null : Border.all(color: Colors.white10),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: Colors.white),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
            ),
          ],
        ),
      ),
    );
  }
}
