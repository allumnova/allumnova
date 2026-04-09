import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/onboarding_provider.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentStep = 0;

  // Controllers
  final _nameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _linkedInController = TextEditingController();

  void _nextStep() {
    if (_currentStep < 2) {
      _pageController.nextPage(duration: const Duration(milliseconds: 400), curve: Curves.easeInOut);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppTheme.background, Color(0xFF1E1B4B)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header & Progress
              _OnboardingHeader(currentStep: _currentStep),

              // Page Content
              Expanded(
                child: PageView(
                  controller: _pageController,
                  physics: const NeverScrollableScrollPhysics(),
                  onPageChanged: (idx) => setState(() => _currentStep = idx),
                  children: [
                    _StepOneBio(
                      nameController: _nameController,
                      usernameController: _usernameController,
                      linkedInController: _linkedInController,
                      onNext: _nextStep,
                    ),
                    _StepTwoCollege(onNext: _nextStep),
                    _StepThreeVerify(onFinish: () {}),
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

class _OnboardingHeader extends StatelessWidget {
  final int currentStep;
  const _OnboardingHeader({required this.currentStep});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'ALLUMNOVA',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 3,
                  color: AppTheme.primary,
                  fontStyle: FontStyle.italic,
                ),
              ),
              _StepIndicator(currentStep: currentStep),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: 120,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white10,
              borderRadius: BorderRadius.circular(2),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: (currentStep + 1) / 3,
              child: Container(
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StepIndicator extends StatelessWidget {
  final int currentStep;
  const _StepIndicator({required this.currentStep});

  @override
  Widget build(BuildContext context) {
    return Text(
      'STEP ${currentStep + 1} OF 3',
      style: const TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w900,
        color: AppTheme.textSecondary,
        letterSpacing: 1,
      ),
    );
  }
}

class _StepOneBio extends StatelessWidget {
  final TextEditingController nameController;
  final TextEditingController usernameController;
  final TextEditingController linkedInController;
  final VoidCallback onNext;

  const _StepOneBio({
    required this.nameController,
    required this.usernameController,
    required this.linkedInController,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(LucideIcons.user, color: AppTheme.primary, size: 48),
          const SizedBox(height: 24),
          const Text(
            'Tell us about yourself',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          const Text(
            'Let the community discover your professional signal.',
            style: TextStyle(fontSize: 14, color: AppTheme.textSecondary),
          ),
          const SizedBox(height: 32),
          _InputField(hint: 'Display Name', controller: nameController, icon: LucideIcons.user),
          const SizedBox(height: 16),
          _InputField(hint: 'Professional Username', controller: usernameController, icon: LucideIcons.globe),
          const SizedBox(height: 16),
          _InputField(hint: 'LinkedIn Profile URL', controller: linkedInController, icon: LucideIcons.linkedin),
          const Spacer(),
          _ContinueButton(onPressed: onNext),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _StepTwoCollege extends StatelessWidget {
  final VoidCallback onNext;
  const _StepTwoCollege({required this.onNext});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(LucideIcons.graduationCap, color: Colors.blueAccent, size: 48),
          const SizedBox(height: 24),
          const Text(
            'Your College',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          const Text(
            'Select your primary institutional silo.',
            style: TextStyle(fontSize: 14, color: AppTheme.textSecondary),
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white10),
            ),
            child: const Row(
              children: [
                Icon(LucideIcons.search, color: AppTheme.textSecondary, size: 20),
                SizedBox(width: 12),
                Text('Search Institutional Silos...', style: TextStyle(color: Colors.white24, fontSize: 14)),
              ],
            ),
          ),
          const Spacer(),
          _ContinueButton(onPressed: onNext),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _StepThreeVerify extends StatelessWidget {
  final VoidCallback onFinish;
  const _StepThreeVerify({required this.onFinish});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(LucideIcons.fileText, color: Colors.emeraldAccent, size: 48),
          const SizedBox(height: 24),
          const Text(
            'Verify Identity',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          const Text(
            'Upload your institutional ID for verification.',
            style: TextStyle(fontSize: 14, color: AppTheme.textSecondary),
          ),
          const SizedBox(height: 32),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(48),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
            ),
            child: const Column(
              children: [
                Icon(LucideIcons.upload, color: AppTheme.textSecondary, size: 32),
                SizedBox(height: 16),
                Text('UPLOAD ID (PDF/IMG)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
              ],
            ),
          ),
          const Spacer(),
          _ContinueButton(onPressed: onFinish, label: 'FINISH SETUP'),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _InputField extends StatelessWidget {
  final String hint;
  final TextEditingController controller;
  final IconData icon;

  const _InputField({required this.hint, required this.controller, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: TextField(
        controller: controller,
        style: const TextStyle(color: Colors.white, fontSize: 14),
        decoration: InputDecoration(
          icon: Icon(icon, color: AppTheme.textSecondary, size: 20),
          hintText: hint,
          hintStyle: const TextStyle(color: Colors.white24, fontSize: 14),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 20),
        ),
      ),
    );
  }
}

class _ContinueButton extends StatelessWidget {
  final VoidCallback onPressed;
  final String label;

  const _ContinueButton({required this.onPressed, this.label = 'CONTINUE'});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 64,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppTheme.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          elevation: 0,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(label, style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 2)),
            const SizedBox(width: 12),
            const Icon(LucideIcons.chevronRight, size: 18),
          ],
        ),
      ),
    );
  }
}
