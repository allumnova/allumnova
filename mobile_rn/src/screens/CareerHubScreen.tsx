import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { GlassContainer } from '../components/ui/GlassContainer';

export const CareerHubScreen = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile/me');
      setProfile(res.data.data);
    } catch (error) {
      console.error('[Career Hub] Sync Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  const sections = [
    { title: 'Experience', icon: 'Briefcase', color: '#60a5fa', count: profile?.experience?.length || 0 },
    { title: 'Education', icon: 'GraduationCap', color: '#10b981', count: profile?.education?.length || 0 },
    { title: 'Projects', icon: 'Target', color: '#c084fc', count: profile?.projects?.length || 0 },
    { title: 'Certifications', icon: 'Award', color: '#f59e0b', count: profile?.certifications?.length || 0 },
  ] as const;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      {/* 🏛️ Strength Header */}
      <GlassContainer className="p-8 mb-8">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-6">
            <Text className="text-2xl font-black text-white tracking-tight mb-2">
              Identity Roadmap
            </Text>
            <Text className="text-textSecondary text-xs leading-5">
              Target: <Text className="text-primary font-black uppercase tracking-tighter">{profile?.targetRole || 'Not Set'}</Text>
            </Text>
          </View>
          
          <View className="items-center justify-center">
            <View className="w-24 h-24 items-center justify-center">
              <View className="absolute inset-0 border-[6px] border-white/5 rounded-full" />
              <View 
                className="absolute inset-0 border-[6px] border-primary rounded-full" 
                style={{ 
                   transform: [{ rotate: '-90deg' }],
                   borderRightColor: 'transparent',
                   borderBottomColor: 'transparent'
                }}
              />
              <View className="items-center">
                <Text className="text-white text-2xl font-black italic">{profile?.completionRatio || 0}%</Text>
                <Text className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Strength</Text>
              </View>
            </View>
          </View>
        </View>
      </GlassContainer>

      {/* 🚀 Suggestions Banner */}
      <GlassContainer className="p-6 mb-8 bg-white flex-row items-center gap-4 border-0">
        <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center">
          <Icon name="Sparkles" size={20} color="#6366f1" />
        </View>
        <View className="flex-1">
          <Text className="text-background font-black text-sm tracking-tight">Level Up Profile</Text>
          <Text className="text-slate-500 text-[10px] font-bold">Strengthen your institutional rank.</Text>
        </View>
        <TouchableOpacity className="bg-background px-4 py-2 rounded-xl">
          <Text className="text-white text-[9px] font-black uppercase tracking-widest">Action</Text>
        </TouchableOpacity>
      </GlassContainer>

      {/* 🔮 Discover Intelligence */}
      <View className="mb-8">
        <Text className="text-white font-black text-sm uppercase tracking-tighter mb-6 italic">Discovery Engine</Text>
        <View className="gap-4">
          <TouchableOpacity className="flex-row items-center gap-4 bg-primary/10 border border-primary/20 p-5 rounded-[2.5rem]">
            <View className="p-3 bg-primary rounded-2xl">
              <Icon name="Activity" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-black text-sm uppercase tracking-tight">Nova Scout</Text>
              <Text className="text-slate-400 text-[10px] font-bold">Parallel signal clustering analysis.</Text>
            </View>
            <Icon name="ChevronRight" size={16} color="#6366f1" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-4 bg-surface/40 border border-white/5 p-5 rounded-[2.5rem]">
            <View className="p-3 bg-indigo-500 rounded-2xl">
              <Icon name="Fingerprint" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-black text-sm uppercase tracking-tight">Archetype Builder</Text>
              <Text className="text-slate-400 text-[10px] font-bold">AI-driven career pathing signal.</Text>
            </View>
            <Icon name="ChevronRight" size={16} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 📋 Career Modular Blocks */}
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {sections.map((section) => (
          <TouchableOpacity 
            key={section.title}
            className="w-[48%]"
          >
            <GlassContainer className="p-6 h-40 justify-between">
              <View className={`w-12 h-12 rounded-2xl items-center justify-center bg-white/5 border border-white/10 shadow-sm shadow-black/20`}>
                <Icon name={section.icon as any} size={20} color={section.color} />
              </View>
              <View>
                <Text className="text-white font-black text-lg tracking-tight mb-1">{section.title}</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest">{section.count} Items</Text>
                  <Icon name="ChevronRight" size={12} color="#475569" />
                </View>
              </View>
            </GlassContainer>
          </TouchableOpacity>
        ))}
      </View>

      <View className="h-24" />
    </ScrollView>
  );
};
