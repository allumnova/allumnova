import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/project_provider.dart';
import '../../auth/providers/auth_provider.dart';
import 'create_project_screen.dart';

class LaunchpadScreen extends ConsumerStatefulWidget {
  const LaunchpadScreen({super.key});

  @override
  ConsumerState<LaunchpadScreen> createState() => _LaunchpadScreenState();
}

class _LaunchpadScreenState extends ConsumerState<LaunchpadScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final collegeId = 'default_college'; // In a real app, this would come from the user's active college

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // 1. Premium Header
          SliverAppBar(
            expandedHeight: 240,
            floating: false,
            pinned: true,
            backgroundColor: AppTheme.background,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF1E1B4B), AppTheme.background],
                  ),
                ),
                child: Stack(
                  children: [
                    Positioned(
                      right: -20,
                      top: 40,
                      child: Icon(LucideIcons.rocket, size: 200, color: AppTheme.primary.withOpacity(0.05)),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'LAUNCHPAD',
                            style: TextStyle(fontSize: 40, fontWeight: FontWeight.w900, letterSpacing: -1, fontStyle: FontStyle.italic),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'The ultimate stage for institutional innovation.',
                            style: TextStyle(fontSize: 14, color: AppTheme.textSecondary, fontWeight: FontWeight.w500),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const CreateProjectScreen())),
                            icon: const Icon(LucideIcons.plus, size: 16),
                            label: const Text('LAUNCH INITIATIVE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.black,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 2. Tab Navigation
          SliverPersistentHeader(
            pinned: true,
            delegate: _SliverAppBarDelegate(
              TabBar(
                controller: _tabController,
                indicatorColor: AppTheme.primary,
                labelColor: Colors.white,
                unselectedLabelColor: AppTheme.textSecondary,
                labelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
                tabs: const [
                  Tab(text: 'DISCOVERY'),
                  Tab(text: 'TRENDING'),
                  Tab(text: 'WORKSPACE'),
                ],
              ),
            ),
          ),

          // 3. Project Feed
          SliverFillRemaining(
            child: TabBarView(
              controller: _tabController,
              children: [
                _ProjectList(provider: launchpadProjectsProvider(collegeId)),
                _ProjectList(provider: trendingProjectsProvider(collegeId)),
                _ProjectList(provider: launchpadProjectsProvider(collegeId), personalOnly: true),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProjectList extends ConsumerWidget {
  final FutureProviderFamily<List<Project>, String> provider;
  final bool personalOnly;
  const _ProjectList({required this.provider, this.personalOnly = false});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final collegeId = 'default_college';
    final user = ref.watch(authProvider).user;
    final projectsState = ref.watch(provider(collegeId));

    return projectsState.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
      error: (e, st) => Center(child: Text('Launch Failure: $e')),
      data: (projects) {
        final filtered = personalOnly 
          ? projects.where((p) => p.ownerId == user?.id).toList()
          : projects;

        if (filtered.isEmpty) {
          return const _EmptyLaunchpad();
        }

        return ListView.builder(
          padding: const EdgeInsets.all(20),
          itemCount: filtered.length,
          itemBuilder: (context, index) => _LaunchpadCard(project: filtered[index]),
        );
      },
    );
  }
}

class _LaunchpadCard extends ConsumerWidget {
  final Project project;
  const _LaunchpadCard({required this.project});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 20, offset: const Offset(0, 10)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: [
                    const Icon(LucideIcons.zap, size: 12, color: AppTheme.primary),
                    const SizedBox(width: 6),
                    Text('${project.hypeScore} HYPE', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.primary)),
                  ],
                ),
              ),
              Text(
                DateFormat('MMM dd').format(project.createdAt),
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textSecondary),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(project.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
          const SizedBox(height: 8),
          Text(project.description, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.5)),
          if (project.lookingFor != null) ...[
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.white.withOpacity(0.02), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withOpacity(0.05))),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('LOOKING FOR', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppTheme.primary, letterSpacing: 1)),
                  const SizedBox(height: 8),
                  Text(project.lookingFor!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white70)),
                ],
              ),
            ),
          ],
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => ref.read(projectServiceProvider).addHype(project.id).then((_) => ref.refresh(launchpadProjectsProvider('default_college'))),
                  icon: const Icon(LucideIcons.zap, size: 16),
                  label: const Text('ADD HYPE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              IconButton(
                icon: const Icon(LucideIcons.share2, size: 20, color: AppTheme.textSecondary),
                onPressed: () {},
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EmptyLaunchpad extends StatelessWidget {
  const _EmptyLaunchpad();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.rocket, size: 64, color: Colors.white.withOpacity(0.05)),
          const SizedBox(height: 24),
          const Text('THE STAGE IS VACANT', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white70, letterSpacing: 2)),
          const SizedBox(height: 8),
          const Text('Be the first to launch an initiative.', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
        ],
      ),
    );
  }
}

class _SliverAppBarDelegate extends SliverPersistentHeaderDelegate {
  _SliverAppBarDelegate(this._tabBar);
  final TabBar _tabBar;

  @override
  double get minExtent => _tabBar.preferredSize.height;
  @override
  double get maxExtent => _tabBar.preferredSize.height;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(color: AppTheme.background, child: _tabBar);
  }
  @override
  bool shouldRebuild(_SliverAppBarDelegate oldDelegate) => false;
}

// Ensure DateFormat is available
import 'package:intl/intl.dart';
