import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../../../core/theme/app_theme.dart';

class ReputationPulsar extends StatefulWidget {
  final int score;
  final String tier;

  const ReputationPulsar({
    super.key,
    required this.score,
    required this.tier,
  });

  @override
  State<ReputationPulsar> createState() => _ReputationPulsarState();
}

class _ReputationPulsarState extends State<ReputationPulsar> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = _getTierColor(widget.tier);

    return SizedBox(
      width: 160,
      height: 160,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Background Pulse
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return CustomPaint(
                painter: _PulsarPainter(
                  animationValue: _controller.value,
                  color: color,
                ),
                size: const Size(160, 160),
              );
            },
          ),
          
          // Inner Identity Container
          Container(
            width: 110,
            height: 110,
            decoration: BoxDecoration(
              color: AppTheme.background,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.3),
                  blurRadius: 30,
                  spreadRadius: 5,
                ),
              ],
              border: Border.all(
                color: color.withOpacity(0.5),
                width: 2,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  widget.score.toString(),
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -1,
                  ),
                ),
                Text(
                  widget.tier.toUpperCase(),
                  style: TextStyle(
                    fontSize: 8,
                    fontWeight: FontWeight.w900,
                    color: color,
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getTierColor(String tier) {
    switch (tier) {
      case 'The Source': return Colors.purpleAccent;
      case 'Frequency': return Colors.roseAccent;
      case 'Resonance': return Colors.amberAccent;
      case 'Pulse': return Colors.emeraldAccent;
      default: return Colors.blueAccent;
    }
  }
}

class _PulsarPainter extends CustomPainter {
  final double animationValue;
  final Color color;

  _PulsarPainter({required this.animationValue, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..color = color.withOpacity(0.2 * (1 - animationValue))
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = size.width / 2;

    // Draw multiple pulse rings
    for (int i = 0; i < 3; i++) {
      double wave = (animationValue + (i / 3)) % 1.0;
      double radius = wave * maxRadius;
      
      canvas.drawCircle(center, radius, paint..color = color.withOpacity(0.15 * (1 - wave)));
    }
    
    // Draw fine institutional accents
    final Paint accentPaint = Paint()
      ..color = color.withOpacity(0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    for (int i = 0; i < 8; i++) {
        double angle = (2 * math.pi / 8) * i + (animationValue * 0.5);
        double x1 = center.dx + 55 * math.cos(angle);
        double y1 = center.dy + 55 * math.sin(angle);
        double x2 = center.dx + (55 + 15 * animationValue) * math.cos(angle);
        double y2 = center.dy + (55 + 15 * animationValue) * math.sin(angle);
        canvas.drawLine(Offset(x1, y1), Offset(x2, y2), accentPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _PulsarPainter oldDelegate) => true;
}
