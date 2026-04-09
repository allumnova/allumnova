import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/connection_provider.dart';

class SignalsScreen extends ConsumerStatefulWidget {
  const SignalsScreen({super.key});

  @override
  ConsumerState<SignalsScreen> createState() => _SignalsScreenState();
}

class _SignalsScreenState extends ConsumerState<SignalsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.background,
        elevation: 0,
        title: const Text('CONNECTIVITY NEXUS', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 2)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primary,
          labelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
          unselectedLabelColor: AppTheme.textSecondary,
          tabs: const [
            Tab(text: 'REQUESTS'),
            Tab(text: 'NETWORK'),
            Tab(text: 'DISCOVER'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          _RequestsTab(),
          _NetworkTab(),
          _DiscoverTab(),
        ],
      ),
    );
  }
}

class _RequestsTab extends ConsumerWidget {
  const _RequestsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pendingState = ref.watch(pendingRequestsProvider);

    return pendingState.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
      error: (e, st) => Center(child: Text('Error: $e')),
      data: (data) {
        final incoming = data['incoming'] ?? [];
        final outgoing = data['outgoing'] ?? [];

        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            if (incoming.isNotEmpty) ...[
              const _SectionLabel(label: 'INCOMING SIGNALS'),
              const SizedBox(height: 12),
              ...incoming.map((req) => _IncomingRequestCard(request: req)),
              const SizedBox(height: 32),
            ],
            if (outgoing.isNotEmpty) ...[
              const _SectionLabel(label: 'SENT SIGNALS'),
              const SizedBox(height: 12),
              ...outgoing.map((req) => _OutgoingRequestCard(request: req)),
            ],
            if (incoming.isEmpty && outgoing.isEmpty)
              const _EmptyState(icon: LucideIcons.clock, message: 'NO PENDING SIGNALS'),
          ],
        );
      },
    );
  }
}

class _NetworkTab extends ConsumerWidget {
  const _NetworkTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final connectionsState = ref.watch(activeConnectionsProvider);

    return connectionsState.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
      error: (e, st) => Center(child: Text('Error: $e')),
      data: (connections) => connections.isEmpty
          ? const _EmptyState(icon: LucideIcons.users, message: 'BUILD YOUR CIRCLE')
          : ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: connections.length,
              itemBuilder: (context, index) => _PeerCard(peer: connections[index]),
            ),
    );
  }
}

class _DiscoverTab extends ConsumerWidget {
  const _DiscoverTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final discoverState = ref.watch(discoverPeersProvider);

    return discoverState.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
      error: (e, st) => Center(child: Text('Error: $e')),
      data: (peers) => peers.isEmpty
          ? const _EmptyState(icon: LucideIcons.search, message: 'NO PEERS FOUND')
          : ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: peers.length,
              itemBuilder: (context, index) => _DiscoverPeerCard(peer: peers[index]),
            ),
    );
  }
}

// Utility Widgets
class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.primary, letterSpacing: 1.5));
  }
}

class _IncomingRequestCard extends ConsumerWidget {
  final ConnectionRequest request;
  const _IncomingRequestCard({required this.request});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = request.user['name'] ?? 'Innovator';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          _Avatar(name: name, avatar: request.user['avatar']),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                Text(request.user['department'] ?? 'Institutional Peer', style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(LucideIcons.check, color: Colors.emerald, size: 20),
            onPressed: () => ref.read(connectionServiceProvider).acceptRequest(request.id).then((_) => ref.refresh(pendingRequestsProvider)),
          ),
          IconButton(
            icon: const Icon(LucideIcons.x, color: Colors.rose, size: 20),
            onPressed: () => ref.read(connectionServiceProvider).declineRequest(request.id).then((_) => ref.refresh(pendingRequestsProvider)),
          ),
        ],
      ),
    );
  }
}

class _OutgoingRequestCard extends StatelessWidget {
  final ConnectionRequest request;
  const _OutgoingRequestCard({required this.request});

  @override
  Widget build(BuildContext context) {
    final name = request.user['name'] ?? 'Innovator';
    return Opacity(
      opacity: 0.7,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.surface.withOpacity(0.5),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          children: [
            _Avatar(name: name, avatar: request.user['avatar'], size: 32),
            const SizedBox(width: 12),
            Expanded(
              child: Text(name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            ),
            const Text('PENDING', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.blueAccent)),
          ],
        ),
      ),
    );
  }
}

class _PeerCard extends StatelessWidget {
  final Map<String, dynamic> peer;
  const _PeerCard({required this.peer});

  @override
  Widget build(BuildContext context) {
    final name = peer['name'] ?? 'Innovator';
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        children: [
          _Avatar(name: name, avatar: peer['avatar'], size: 64),
          const SizedBox(height: 16),
          Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          Text(peer['role'] ?? 'PEER', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textSecondary, letterSpacing: 1)),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(child: _SignalButton(label: 'MESSAGE', icon: LucideIcons.messageSquare, onPressed: () {})),
              const SizedBox(width: 8),
              _SignalButton(label: 'PROFILE', icon: LucideIcons.user, onPressed: () {}, isIconOnly: true),
            ],
          ),
        ],
      ),
    );
  }
}

class _DiscoverPeerCard extends ConsumerWidget {
  final Map<String, dynamic> peer;
  const _DiscoverPeerCard({required this.peer});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = peer['name'] ?? 'Innovator';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface.withOpacity(0.5),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          _Avatar(name: name, avatar: peer['avatar']),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                Text('${peer['colleges']?[0]?['role'] ?? "Student"} • ${peer['colleges']?[0]?['batch'] ?? ""}', style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () => ref.read(connectionServiceProvider).sendRequest(peer['id']).then((_) => ref.refresh(discoverPeersProvider)),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8)),
            child: const Text('CONNECT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  final String name;
  final String? avatar;
  final double size;
  const _Avatar({required this.name, this.avatar, this.size = 48});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: AppTheme.primary.withOpacity(0.1),
        image: avatar != null ? DecorationImage(image: NetworkImage(avatar!), fit: BoxFit.cover) : null,
      ),
      child: avatar == null ? Center(child: Text(name[0], style: TextStyle(fontSize: size * 0.4, fontWeight: FontWeight.bold))) : null,
    );
  }
}

class _SignalButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onPressed;
  final bool isIconOnly;

  const _SignalButton({required this.label, required this.icon, required this.onPressed, this.isIconOnly = false});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white.withOpacity(0.05))),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 16, color: Colors.blueAccent),
            if (!isIconOnly) ...[
              const SizedBox(width: 8),
              Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
            ],
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;
  const _EmptyState({required this.icon, required this.message});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 80),
      child: Column(
        children: [
          Icon(icon, size: 48, color: Colors.white12),
          const SizedBox(height: 16),
          Text(message, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.textSecondary, letterSpacing: 1)),
        ],
      ),
    );
  }
}
