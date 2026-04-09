import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';
import '../network/api_client.dart';

class NotificationService {
  final ApiClient _apiClient;
  bool _isInitialized = false;

  NotificationService(this._apiClient);

  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    if (_isInitialized) return;

    // 1. Initialize Firebase Core
    // Note: This requires google-services.json to be in android/app/
    try {
      await Firebase.initializeApp();
    } catch (e) {
      if (kDebugMode) print('Firebase already initialized or missing config: $e');
    }

    // 2. Request Permissions
    NotificationSettings settings = await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      // 3. Initialize Local Notifications for Foreground
      const AndroidInitializationSettings androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
      const InitializationSettings initSettings = InitializationSettings(android: androidSettings);
      await _localNotifications.initialize(initSettings);

      // 4. Setup Listeners
      _setupMessageHandlers();
      
      _isInitialized = true;
    }
  }

  void _setupMessageHandlers() {
    // A. Foreground Messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      RemoteNotification? notification = message.notification;
      AndroidNotification? android = message.notification?.android;

      if (notification != null && android != null) {
        _localNotifications.show(
          notification.hashCode,
          notification.title,
          notification.body,
          const NotificationDetails(
            android: AndroidNotificationDetails(
              'high_importance_channel',
              'High Importance Notifications',
              importance: Importance.max,
              priority: Priority.high,
              icon: '@mipmap/ic_launcher',
            ),
          ),
        );
      }
    });

    // B. Background/Terminated Click
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      if (kDebugMode) print('Notification clicked: ${message.data}');
      // Handle navigation logic here (e.g., navigate to Chat or Project)
    });
  }

  Future<void> syncToken() async {
    String? token = await FirebaseMessaging.instance.getToken();
    if (token != null) {
      if (kDebugMode) print('FCM Token: $token');
      try {
        await _apiClient.post('/auth/fcm-token', data: {'token': token});
      } catch (e) {
        if (kDebugMode) print('Failed to sync FCM token: $e');
      }
    }
  }
}
