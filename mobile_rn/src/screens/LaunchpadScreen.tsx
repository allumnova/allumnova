import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { Project } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { GlassContainer } from '../components/ui/GlassContainer';
import { CreateProjectModal } from '../components/ui/CreateProjectModal';

export const LaunchpadScreen = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'workspace'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects/college/global', {
        params: { search: searchTerm || undefined }
      });
      
      if (res.data.success) {
        let processed = res.data.projects || [];
        if (activeTab === 'trending') {
          processed = [...processed].sort((a, b) => b.hypeScore - a.hypeScore);
        } else if (activeTab === 'workspace') {
          processed = processed.filter((p: Project) => p.ownerId === user?.id);
        }
        setProjects(processed);
      }
    } catch (error) {
      console.error('[Launchpad] Sync Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, activeTab]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
        {/* 🚀 Creative Header */}
        <GlassContainer className="p-8 mb-8 border border-primary/20 bg-primary/5">
          <View className="flex-row items-center gap-4 mb-4">
            <View className="p-3 bg-primary rounded-2xl">
              <Icon name="Rocket" size={24} color="white" />
            </View>
            <Text className="text-3xl font-black text-white italic uppercase tracking-tighter">
              Launchpad
            </Text>
          </View>
          <Text className="text-textSecondary font-medium leading-5 mb-6">
            The ultimate stage for institutional innovation. Build, showcase, and get the hype.
          </Text>
          <TouchableOpacity 
            onPress={() => setShowCreateModal(true)}
            className="bg-white px-6 py-4 rounded-2xl items-center shadow-xl"
          >
            <View className="flex-row items-center gap-2">
              <Icon name="Plus" size={16} color="#0f172a" strokeWidth={3} />
              <Text className="text-background font-black text-[10px] uppercase tracking-widest">
                Launch Initiative
              </Text>
            </View>
          </TouchableOpacity>
        </GlassContainer>

        {/* 🔍 Search & Filter Hub */}
        <View className="mb-8">
          <GlassContainer className="p-1.5 flex-row mb-4">
            {['all', 'trending', 'workspace'].map((tab) => (
              <TouchableOpacity 
                key={tab}
                onPress={() => setActiveTab(tab as any)}
                className={`flex-1 py-3 items-center rounded-2xl ${activeTab === tab ? 'bg-white shadow-md' : ''}`}
              >
                <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === tab ? 'text-background' : 'text-textSecondary'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </GlassContainer>

          <View className="relative">
            <View className="absolute left-5 top-4 z-10">
              <Icon name="Search" size={18} color="#94a3b8" />
            </View>
            <TextInput
              placeholder="Search initiatives..."
              placeholderTextColor="#475569"
              value={searchTerm}
              onChangeText={setSearchTerm}
              className="bg-surface/30 border border-white/5 rounded-3xl py-4 pl-14 pr-6 text-white font-bold text-sm"
            />
          </View>
        </View>

        {/* ⚡ Innovation Feed */}
        {loading ? (
          <ActivityIndicator color="#6366f1" size="large" className="mt-20" />
        ) : projects.length > 0 ? (
          <View className="gap-6">
            {projects.map((project) => (
              <GlassContainer key={project.id} className="p-6">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-white text-xl font-black uppercase tracking-tight mb-1">
                      {project.title}
                    </Text>
                    <Text className="text-textSecondary text-xs font-semibold">
                      by {project.owner.name}
                    </Text>
                  </View>
                  <View className="bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 flex-row items-center gap-1">
                    <Icon name="Zap" size={12} color="#6366f1" />
                    <Text className="text-primary text-[10px] font-black">
                      {project.hypeScore}
                    </Text>
                  </View>
                </View>
                
                <Text className="text-white/80 text-sm leading-5 mb-4" numberOfLines={3}>
                  {project.description}
                </Text>
                
                <View className="h-[1px] bg-white/5 mb-4" />
                
                <View className="flex-row justify-between items-center">
                  <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                    Status: {project.status}
                  </Text>
                  <TouchableOpacity className="bg-primary/20 px-4 py-2 rounded-xl">
                    <Text className="text-primary text-[10px] font-black uppercase tracking-widest">
                      Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassContainer>
            ))}
          </View>
        ) : (
          <View className="py-20 items-center justify-center opacity-40">
            <Icon name="Rocket" size={64} color="#94a3b8" strokeWidth={1} />
            <Text className="text-white font-bold mt-4">No initiatives found</Text>
          </View>
        )}

        <View className="h-40" />
      </ScrollView>

      {/* ➕ Innovation FAB */}
      <TouchableOpacity 
        onPress={() => setShowCreateModal(true)}
        className="absolute bottom-32 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-2xl shadow-primary/40 z-50"
      >
        <Icon name="Plus" size={24} color="white" strokeWidth={3} />
      </TouchableOpacity>

      <CreateProjectModal 
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRefresh={fetchProjects}
      />
    </View>
  );
};
