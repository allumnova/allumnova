import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Structured Models for Portfolio
class Experience {
  final String company;
  final String position;
  final String description;
  final DateTime startDate;
  final DateTime? endDate;
  final bool isCurrent;

  Experience({
    required this.company,
    required this.position,
    required this.description,
    required this.startDate,
    this.endDate,
    this.isCurrent = false,
  });

  factory Experience.fromJson(Map<String, dynamic> json) {
    return Experience(
      company: json['company'] ?? '',
      position: json['position'] ?? '',
      description: json['description'] ?? '',
      startDate: DateTime.parse(json['startDate']),
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : null,
      isCurrent: json['isCurrent'] ?? false,
    );
  }
}

class Education {
  final String degree;
  final String school;
  final DateTime startDate;
  final DateTime? endDate;
  final String? field;

  Education({
    required this.degree,
    required this.school,
    required this.startDate,
    this.endDate,
    this.field,
  });

  factory Education.fromJson(Map<String, dynamic> json) {
    return Education(
      degree: json['degree'] ?? '',
      school: json['school'] ?? '',
      startDate: DateTime.parse(json['startDate']),
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : null,
      field: json['field'],
    );
  }
}

// Profile Data Class (Expanded)
class UserProfile {
  final String id;
  final String name;
  final String? bio;
  final String? avatar;
  final String? role;
  final String? department;
  final String? tierLevel;
  final int? reputationScore;
  final String? careerObjective;
  final String? linkedIn;
  final String? username;
  final String? location;
  final List<dynamic>? posts;
  final List<dynamic>? projects;
  
  // Professional Record Fields
  final List<Experience>? experience;
  final List<Education>? education;
  final Map<String, dynamic>? techSkills;
  final List<String>? achievements;
  final List<String>? hobbies;

  UserProfile({
    required this.id,
    required this.name,
    this.bio,
    this.avatar,
    this.role,
    this.department,
    this.tierLevel,
    this.reputationScore,
    this.careerObjective,
    this.linkedIn,
    this.username,
    this.location,
    this.posts,
    this.projects,
    this.experience,
    this.education,
    this.techSkills,
    this.achievements,
    this.hobbies,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'],
      name: json['name'] ?? 'Incognito',
      bio: json['bio'],
      avatar: json['avatar'],
      role: json['role'] ?? 'student',
      department: json['department'],
      tierLevel: json['tierLevel'] ?? 'Echo',
      reputationScore: json['reputationScore'] ?? 0,
      careerObjective: json['careerObjective'],
      linkedIn: json['linkedIn'],
      username: json['username'],
      location: json['location'],
      posts: json['posts'] ?? [],
      projects: json['projects'] ?? [],
      experience: (json['experience'] as List?)?.map((e) => Experience.fromJson(e)).toList(),
      education: (json['education'] as List?)?.map((e) => Education.fromJson(e)).toList(),
      techSkills: json['techSkills'],
      achievements: (json['achievements'] as List?)?.map((a) => a.toString()).toList(),
      hobbies: (json['hobbies'] as List?)?.map((h) => h.toString()).toList(),
    );
  }
}

// Profile Service
class ProfileService {
  final ApiClient _apiClient;
  ProfileService(this._apiClient);

  Future<UserProfile> fetchProfile(String userId) async {
    try {
      final response = await _apiClient.get('/profile/$userId');
      return UserProfile.fromJson(response.data['data']);
    } catch (e) {
      rethrow;
    }
  }

  Future<UserProfile> fetchPortfolio(String username) async {
    try {
      final response = await _apiClient.get('/profile/portfolio/$username');
      return UserProfile.fromJson(response.data['data']);
    } catch (e) {
      rethrow;
    }
  }
}

// Providers (Simplified for brevity)
final profileServiceProvider = Provider<ProfileService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ProfileService(apiClient);
});

final profileProvider = StateNotifierProvider.family<ProfileNotifier, AsyncValue<UserProfile>, String>((ref, userId) {
  final service = ref.watch(profileServiceProvider);
  return ProfileNotifier(service, userId);
});

// New Portfolio Provider
final portfolioProvider = FutureProvider.family<UserProfile, String>((ref, username) async {
  return ref.watch(profileServiceProvider).fetchPortfolio(username);
});

class ProfileNotifier extends StateNotifier<AsyncValue<UserProfile>> {
  final ProfileService _service;
  final String _userId;

  ProfileNotifier(this._service, this._userId) : super(const AsyncValue.loading()) {
    fetch();
  }

  Future<void> fetch() async {
    state = const AsyncValue.loading();
    try {
      final profile = await _service.fetchProfile(_userId);
      state = AsyncValue.data(profile);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}
