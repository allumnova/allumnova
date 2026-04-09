import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../features/feed/presentation/screens/feed_screen.dart';
import '../features/hubs/presentation/screens/discover_hubs_screen.dart';
import '../features/social/presentation/screens/signals_screen.dart';
import '../features/projects/presentation/screens/launchpad_screen.dart';
import '../features/profile/presentation/screens/profile_screen.dart';
import '../features/auth/providers/auth_provider.dart';
import 'app_theme.dart';

class MainScaffold extends ConsumerStatefulWidget {
  const MainScaffold({super.key});

  @override
  ConsumerState<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends ConsumerState<MainScaffold> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    
    final List<Widget> screens = [
      const FeedScreen(),
      const LaunchpadScreen(),
      const SignalsScreen(),
      ProfileScreen(userId: user?.id ?? ''),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppTheme.background,
          border: Border(top: BorderSide(color: Colors.white.withOpacity(0.05))),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (idx) => setState(() => _currentIndex = idx),
          backgroundColor: Colors.transparent,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: AppTheme.primary,
          unselectedItemColor: AppTheme.textSecondary,
          showSelectedLabels: true,
          showUnselectedLabels: true,
          selectedLabelStyle: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 1),
          unselectedLabelStyle: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 1),
          elevation: 0,
          items: const [
            BottomNavigationBarItem(icon: Icon(LucideIcons.home, size: 20), label: 'NEXUS'),
            BottomNavigationBarItem(icon: Icon(LucideIcons.rocket, size: 20), label: 'LAUNCHPAD'),
            BottomNavigationBarItem(icon: Icon(LucideIcons.zap, size: 20), label: 'SIGNALS'),
            BottomNavigationBarItem(icon: Icon(LucideIcons.user, size: 20), label: 'IDENTITY'),
          ],
        ),
      ),
    );
  }
}
