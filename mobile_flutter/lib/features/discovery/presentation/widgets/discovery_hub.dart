import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/discovery_provider.dart';

class DiscoveryHub extends ConsumerWidget {
  const DiscoveryHub({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final discoveryState = ref.watch(discoveryProvider);

    return discoveryState.when(
      loading: () => const _DiscoverySkeleton(),
      error: (e, st) => const SizedBox.shrink(),
      data: (brief) => SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 12),
            // Header + AI Briefing Card
            _AIBriefingCard(briefing: brief.briefing),
            const SizedBox(height: 32),

            // Peer Recommendations
            _DiscoverySection(
              title: 'HIGH-SIGNAL PEERS',
              icon: LucideIcons.users,
              iconColor: Colors.purple,
              items: brief.peers,
              itemBuilder: (peer) => _PeerCard(peer: peer),
            ),
            const SizedBox(height: 24),

            // Aligned Societies
            _DiscoverySection(
              title: 'ALIGNED SOCIETIES',
              icon: LucideIcons.shieldCheck,
              iconColor: Colors.emerald,
              items: brief.societies,
              itemBuilder: (hub) => _SocietyCard(hub: hub),
            ),
            const SizedBox(height: 24),

            // Skill-Match Projects
            _DiscoverySection(
              title: 'SKILL-MATCH PROJECTS',
              icon: LucideIcons.rocket,
              iconColor: Colors.amber,
              items: brief.projects,
              itemBuilder: (project) => _ProjectCard(project: project),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class _AIBriefingCard extends StatelessWidget {
  final String briefing;
  const _AIBriefingCard({required this.briefing});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF9333EA), Color(0xFF4338CA)],
        ),
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.purple.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(LucideIcons.sparkles, color: Colors.white, size: 20),
              ),
              const SizedBox(width: 12),
              const Text(
                'RESEARCH BRIEFING',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: 2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            '"$briefing"',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: Colors.white,
              fontStyle: FontStyle.italic,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

class _DiscoverySection extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color iconColor;
  final List<dynamic> items;
  final Widget Function(dynamic) itemBuilder;

  const _DiscoverySection({
    required this.title,
    required this.icon,
    required this.iconColor,
    required this.items,
    required this.itemBuilder,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: iconColor, size: 16),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w900,
                color: AppTheme.textSecondary,
                letterSpacing: 2,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 110,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: items.length,
            clipBehavior: Clip.none,
            itemBuilder: (context, index) => Padding(
              padding: const EdgeInsets.only(right: 16),
              child: SizedBox(width: 260, child: itemBuilder(items[index])),
            ),
          ),
        ),
      ],
    );
  }
}

class _PeerCard extends StatelessWidget {
  final dynamic peer;
  const _PeerCard({required this.peer});

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppTheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              image: peer['avatar'] != null 
                ? DecorationImage(image: NetworkImage(peer['avatar']), fit: BoxFit.cover)
                : null,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  peer['name'] ?? 'Incognito',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  peer['matchReason'] ?? 'Signal Match',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: Colors.purpleAccent,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const Icon(LucideIcons.chevronRight, color: Colors.white24, size: 20),
        ],
      ),
    );
  }
}

class _SocietyCard extends StatelessWidget {
  final dynamic hub;
  const _SocietyCard({required this.hub});

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Colors.emerald.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(LucideIcons.shieldCheck, color: Colors.emerald, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  hub['name'] ?? 'Elite Society',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '${hub['memberCount'] ?? 0} MEMBERS',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: Colors.emeraldAccent,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProjectCard extends StatelessWidget {
  final dynamic project;
  const _ProjectCard({required this.project});

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(LucideIcons.rocket, color: Colors.amber, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  project['title'] ?? 'Initiative',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'SEEKING: ${project['lookingFor'] ?? 'Collaborators'}',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: Colors.amberAccent,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DiscoverySkeleton extends StatelessWidget {
  const _DiscoverySkeleton();
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 200,
      margin: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white10,
        borderRadius: BorderRadius.circular(32),
      ),
      child: const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
    );
  }
}
