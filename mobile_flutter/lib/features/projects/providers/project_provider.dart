import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Project Model
class Project {
  final String id;
  final String title;
  final String description;
  final String? lookingFor;
  final int hypeScore;
  final String ownerId;
  final String? ownerName;
  final DateTime createdAt;

  Project({
    required this.id,
    required this.title,
    required this.description,
    this.lookingFor,
    this.hypeScore = 0,
    required this.ownerId,
    this.ownerName,
    required this.createdAt,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'],
      title: json['title'] ?? 'Untitled Initiative',
      description: json['description'] ?? '',
      lookingFor: json['lookingFor'],
      hypeScore: json['hypeScore'] ?? 0,
      ownerId: json['ownerId'] ?? '',
      ownerName: json['owner']?['name'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

// Project Service
class ProjectService {
  final ApiClient _apiClient;
  ProjectService(this._apiClient);

  Future<List<Project>> fetchCollegeProjects(String collegeId) async {
    final response = await _apiClient.get('/projects/college/$collegeId');
    final List projects = response.data['projects'] ?? [];
    return projects.map((p) => Project.fromJson(p)).toList();
  }

  Future<void> createProject({
    required String title,
    required String description,
    String? lookingFor,
  }) async {
    await _apiClient.post('/projects', data: {
      'title': title,
      'description': description,
      'lookingFor': lookingFor,
    });
  }

  Future<void> addHype(String projectId) async {
    await _apiClient.post('/projects/$projectId/hype');
  }
}

// Global Providers
final projectServiceProvider = Provider<ProjectService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ProjectService(apiClient);
});

// Launchpad Projects Provider (Tab-based)
final launchpadProjectsProvider = FutureProvider.family<List<Project>, String>((ref, collegeId) async {
  return ref.watch(projectServiceProvider).fetchCollegeProjects(collegeId);
});

final trendingProjectsProvider = FutureProvider.family<List<Project>, String>((ref, collegeId) async {
  final projects = await ref.watch(projectServiceProvider).fetchCollegeProjects(collegeId);
  projects.sort((a, b) => b.hypeScore.compareTo(a.hypeScore));
  return projects;
});
