import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/feed_provider.dart';
import 'package:intl/intl.dart';

class PostCard extends ConsumerWidget {
  final Post post;
  const PostCard({super.key, required this.post});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppTheme.surface.withOpacity(0.5),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Stack(
        children: [
          // Type Badge Ribbon
          Positioned(
            top: 0,
            right: 24,
            child: _TypeBadge(type: post.postType),
          ),

          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Author Row
                _AuthorHeader(author: post.author, createdAt: post.createdAt),
                const SizedBox(height: 16),

                // Content
                Text(
                  post.content,
                  style: const TextStyle(
                    fontSize: 14,
                    height: 1.5,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),

                // Post Type Specific Metadata
                if (post.postType != 'general') _MetadataRenderer(post: post),

                // Media Renderer (Simplistic for now)
                if (post.media != null && post.media!.isNotEmpty)
                  _MediaRenderer(media: post.media!),

                const SizedBox(height: 16),
                const Divider(color: Colors.white10),
                const SizedBox(height: 8),

                // Interaction Bar
                _InteractionBar(post: post),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AuthorHeader extends StatelessWidget {
  final Map<String, dynamic>? author;
  final DateTime createdAt;
  const _AuthorHeader({this.author, required this.createdAt});

  @override
  Widget build(BuildContext context) {
    final name = author?['name'] ?? 'Unknown';
    final avatar = author?['avatar'];
    final tier = author?['tierLevel'] ?? 'Echo';
    final reputation = author?['reputationScore'] ?? 0;

    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            image: avatar != null ? DecorationImage(image: NetworkImage(avatar), fit: BoxFit.cover) : null,
            color: AppTheme.primary.withOpacity(0.1),
          ),
          child: avatar == null ? Center(child: Text(name[0], style: const TextStyle(fontWeight: FontWeight.bold))) : null,
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                const SizedBox(width: 6),
                _TierBadge(tier: tier, score: reputation),
              ],
            ),
            Text(
              DateFormat.yMMMd().format(createdAt),
              style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary),
            ),
          ],
        ),
      ],
    );
  }
}

class _TypeBadge extends StatelessWidget {
  final String type;
  const _TypeBadge({required this.type});

  @override
  Widget build(BuildContext context) {
    final config = _getTypeConfig(type);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: config.color.withOpacity(0.1),
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(12)),
        border: Border.all(color: config.color.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(config.icon, size: 10, color: config.color),
          const SizedBox(width: 4),
          Text(
            type.toUpperCase(),
            style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: config.color, letterSpacing: 1),
          ),
        ],
      ),
    );
  }
}

class _MetadataRenderer extends StatelessWidget {
  final Post post;
  const _MetadataRenderer({required this.post});

  @override
  Widget build(BuildContext context) {
    if (post.postType == 'showcase') {
      final title = post.metadata?['title'] ?? 'New Initiative';
      final seeker = post.metadata?['lookingFor'];
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.purple.withOpacity(0.05),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.purple.withOpacity(0.1)),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Colors.purple, Colors.blue]),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(LucideIcons.rocket, color: Colors.white, size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
                      if (seeker != null)
                        Text('SEEKING: $seeker', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.purpleAccent)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Center(
                child: Text('EXPLORE RECORD', style: TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
              ),
            ),
          ],
        ),
      );
    }
    return const SizedBox.shrink();
  }
}

class _MediaRenderer extends StatelessWidget {
  final List<dynamic> media;
  const _MediaRenderer({required this.media});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        image: DecorationImage(image: NetworkImage(media[0]['url']), fit: BoxFit.cover),
      ),
    );
  }
}

class _InteractionBar extends StatelessWidget {
  final Post post;
  const _InteractionBar({required this.post});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            _ActionButton(icon: LucideIcons.heart, count: post.counts['likes'] ?? 0),
            const SizedBox(width: 16),
            _ActionButton(icon: LucideIcons.messageSquare, count: post.counts['comments'] ?? 0),
          ],
        ),
        const Icon(LucideIcons.zap, color: AppTheme.textSecondary, size: 18),
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final int count;
  const _ActionButton({required this.icon, required this.count});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppTheme.textSecondary),
        const SizedBox(width: 6),
        Text(count.toString(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
      ],
    );
  }
}

class _TierBadge extends StatelessWidget {
  final String tier;
  final int score;
  const _TierBadge({required this.tier, required this.score});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Text('$tier • $score', style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
    );
  }
}

class _TypeConfig {
  final IconData icon;
  final Color color;
  _TypeConfig(this.icon, this.color);
}

_TypeConfig _getTypeConfig(String type) {
  switch (type) {
    case 'showcase': return _TypeConfig(LucideIcons.rocket, Colors.purple);
    case 'opportunity': return _TypeConfig(LucideIcons.briefcase, Colors.blue);
    case 'achievement': return _TypeConfig(LucideIcons.trophy, Colors.amber);
    case 'event': return _TypeConfig(LucideIcons.calendar, Colors.emerald);
    default: return _TypeConfig(LucideIcons.fileText, Colors.slate);
  }
}
