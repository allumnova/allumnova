import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/auth/presentation/screens/login_screen.dart';
import 'features/feed/presentation/screens/feed_screen.dart';
import 'core/theme/main_scaffold.dart';
import 'core/services/notification_service.dart';
import 'core/network/api_client.dart';

final notificationServiceProvider = Provider<NotificationService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return NotificationService(apiClient);
});

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: AllumnovaApp(),
    ),
  );
}

class AllumnovaApp extends ConsumerWidget {
  const AllumnovaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: 'Allumnova',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const AuthGate(),
    );
  }
}

class AuthGate extends ConsumerWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    if (authState.loading) {
      return const SplashScreen();
    }

    if (authState.isAuthenticated) {
      // Sync FCM token when authenticated
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(notificationServiceProvider).initialize().then((_) {
          ref.read(notificationServiceProvider).syncToken();
        });
      });
      return const MainScaffold();
    }

    return const LoginScreen();
  }
}

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppTheme.background,
              Color(0xFF1E1B4B),
            ],
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppTheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(32),
                border: Border.all(color: AppTheme.primary.withOpacity(0.2)),
              ),
              child: const Icon(
                Icons.rocket_launch_rounded,
                size: 64,
                color: AppTheme.primary,
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'ALLUMNOVA',
              style: GoogleFonts.outfit(
                fontSize: 40,
                fontWeight: FontWeight.w900,
                letterSpacing: 4,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
