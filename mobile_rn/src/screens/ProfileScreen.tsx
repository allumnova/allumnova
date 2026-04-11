import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { GlassContainer } from '../components/ui/GlassContainer';

export const ProfileScreen = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'projects' | 'about'>('posts');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile/me');
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (error) {
      console.error('[Identity Hub] Sync Error:', error);
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

  if (!profile) return null;

  const stats = [
    { label: 'Impact', value: profile.reputationScore || 0, icon: 'Shield', color: '#60a5fa' },
    { label: 'Posts', value: profile.posts?.length || 0, icon: 'Grid', color: '#94a3b8' },
    { label: 'Showcase', value: profile.projects?.length || 0, icon: 'Rocket', color: '#c084fc' },
  ] as const;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 120 }}>
      {/* 👤 Identity Header */}
      <View className="items-center pt-12 pb-8 px-6">
        <View className="w-32 h-32 rounded-[3.5rem] bg-primary p-1 shadow-2xl shadow-primary/20 mb-6">
          <View className="w-full h-full bg-background rounded-[3.2rem] overflow-hidden p-0.5">
            <Image 
              source={{ uri: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}` }} 
              className="w-full h-full rounded-[3rem]"
            />
          </View>
        </View>

        <View className="items-center gap-2 mb-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-3xl font-black text-white tracking-tight">{profile.name}</Text>
          </View>
          <View className="flex-row gap-2">
            <View className="bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 flex-row items-center gap-1.5">
              <Icon name="Sparkles" size={10} color="#6366f1" />
              <Text className="text-primary text-[10px] font-black uppercase tracking-widest">
                {profile.tierLevel || 'Echo'}
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-textSecondary text-sm font-black uppercase tracking-widest text-center">
          {profile.department || 'Institutional Member'}
        </Text>

        <View className="flex-row gap-4 mt-8 w-full">
          <TouchableOpacity className="flex-1 bg-white py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-xl shadow-white/5">
            <Icon name="Settings" size={18} color="#0f172a" />
            <Text className="text-background font-black text-xs uppercase tracking-widest">Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🚀 Elite Showcase Gateway */}
      <View className="px-5 mb-8">
        <TouchableOpacity className="overflow-hidden rounded-[2.5rem]">
          <GlassContainer className="p-8 border border-primary/20 bg-primary/10">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-white text-xl font-black tracking-tighter italic uppercase mb-2">Elite Showcase</Text>
                <Text className="text-textSecondary text-[10px] font-medium leading-4">Launch your next institutional milestone. Get high-signal visibility.</Text>
              </View>
              <View className="w-16 h-16 bg-primary rounded-3xl items-center justify-center shadow-2xl shadow-primary/40">
                <Icon name="Rocket" size={32} color="white" />
              </View>
            </View>
            <View className="mt-6 flex-row items-center gap-2">
              <Text className="text-primary text-[9px] font-black uppercase tracking-[0.2em]">Start your showcase journey</Text>
              <Icon name="ArrowRight" size={10} color="#6366f1" />
            </View>
          </GlassContainer>
        </TouchableOpacity>
      </View>

      {/* 📊 Professional Metrics */}
      <View className="flex-row px-5 gap-3 mb-8">
        {stats.map((stat) => (
          <GlassContainer key={stat.label} className="flex-1 p-5 items-center gap-1">
            <Icon name={stat.icon} size={18} color={stat.color} />
            <Text className="text-white text-xl font-black tracking-tight">{stat.value}</Text>
            <Text className="text-textSecondary text-[8px] font-black uppercase tracking-widest">{stat.label}</Text>
          </GlassContainer>
        ))}
      </View>

      {/* 📑 Hub Navigation */}
      <View className="px-5 mb-6">
        <GlassContainer className="p-1.5 flex-row">
          {['posts', 'projects', 'about'].map((t) => (
            <TouchableOpacity 
              key={t} 
              onPress={() => setActiveTab(t as any)} 
              className={`flex-1 py-3.5 items-center rounded-2xl ${activeTab === t ? 'bg-white shadow-xl' : ''}`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === t ? 'text-background' : 'text-textSecondary'}`}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </GlassContainer>
      </View>

      {/* 🖼️ Hub Feed */}
      <View className="px-5">
        {activeTab === 'about' ? (
          <View className="gap-6">
            {profile.careerObjective && (
              <GlassContainer className="p-8">
                <Text className="text-primary text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">
                  Career Objective
                </Text>
                <Text className="text-white/80 text-sm leading-6 italic">
                  "{profile.careerObjective}"
                </Text>
              </GlassContainer>
            )}
            
            <GlassContainer className="p-8 items-center text-center">
              <Icon name="MapPin" size={32} color="#475569" />
              <Text className="text-white font-black text-lg mb-2 mt-4">Member Details</Text>
              <Text className="text-textSecondary text-sm text-center leading-5">
                {profile.name} is a student from the {profile.department || 'General'} branch.
              </Text>
            </GlassContainer>
          </View>
        ) : (
          <View className="py-20 items-center justify-center opacity-40">
            <Icon name="Grid" size={48} color="#94a3b8" strokeWidth={1} />
            <Text className="text-white font-bold mt-4 uppercase tracking-widest text-[10px]">
              No {activeTab} Activity Yet
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
