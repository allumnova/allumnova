import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { GlassContainer } from '../components/ui/GlassContainer';
import { PortfolioSection } from '../components/ui/PortfolioSection';
import { EditSectionModal } from '../components/ui/EditSectionModal';

type ProfileTab = 'overview' | 'history' | 'academic' | 'showcase';

export const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState<'experience' | 'education' | 'project'>('experience');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile/me');
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (error) {
      console.error('[Portfolio] Sync Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleShare = async () => {
    if (!profile?.username) return;
    try {
      await Share.share({
        message: `Check out my Allumnova professional portfolio: https://allumnova.cloud/u/${profile.username}`,
        url: `https://allumnova.cloud/u/${profile.username}`,
      });
    } catch (error) {
      console.error('[Portfolio] Share Error:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  if (!profile) return null;

  const stats = [
    { label: 'Reputation', value: profile.reputationScore || 0, icon: 'Shield', color: '#60a5fa' },
    { label: 'Connections', value: profile._count?.connections || 0, icon: 'Users', color: '#10b981' },
    { label: 'Hype', value: profile._count?.projects || 0, icon: 'Rocket', color: '#c084fc' },
  ] as const;

  const renderOverview = () => (
    <View className="gap-6">
      <GlassContainer className="p-8">
        <Text className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">Institutional Presence</Text>
        <Text className="text-white/80 text-sm leading-6 font-medium">
          {profile.careerObjective || "Passionate institutional member focused on growth and collaborative documentation."}
        </Text>
      </GlassContainer>

      <View className="flex-row gap-4">
        <GlassContainer className="flex-1 p-6 items-center">
            <Icon name="Globe" size={20} color="#6366f1" />
            <Text className="text-white font-bold text-xs mt-3">Public Hub</Text>
            <Text className="text-slate-500 text-[9px] mt-1">/u/{profile.username}</Text>
        </GlassContainer>
        <GlassContainer className="flex-1 p-6 items-center">
            <Icon name="Target" size={20} color="#10b981" />
            <Text className="text-white font-bold text-xs mt-3">Archetype</Text>
            <Text className="text-slate-500 text-[9px] mt-1">{profile.careerStage || 'Innovator'}</Text>
        </GlassContainer>
      </View>
    </View>
  );

  const renderHistory = () => (
    <PortfolioSection 
      title="Professional History" 
      icon="Briefcase"
      items={profile.experience?.map((exp: any) => ({
        id: exp.id,
        title: exp.position,
        subtitle: exp.company,
        dateRange: `${new Date(exp.startDate).getFullYear()} - ${exp.isCurrent ? 'Present' : new Date(exp.endDate).getFullYear()}`,
        description: exp.description
      })) || []}
      onAdd={() => { setEditType('experience'); setShowEditModal(true); }}
      emptyMessage="No professional milestones documented yet."
    />
  );

  const renderAcademic = () => (
    <PortfolioSection 
      title="Academic Records" 
      icon="GraduationCap"
      items={profile.education?.map((edu: any) => ({
        id: edu.id,
        title: edu.degree,
        subtitle: edu.school,
        dateRange: `${new Date(edu.startDate).getFullYear()} - ${new Date(edu.endDate).getFullYear()}`,
        metadata: `Score: ${edu.field || 'Verified'}`
      })) || []}
      onAdd={() => { setEditType('education'); setShowEditModal(true); }}
    />
  );

  const renderShowcase = () => (
    <PortfolioSection 
      title="Project Showcase" 
      icon="Rocket"
      items={profile.projects?.map((prj: any) => ({
        id: prj.id,
        title: prj.title,
        subtitle: "Key Initiative",
        dateRange: "V.1.0",
        description: prj.description
      })) || []}
      onAdd={() => { setEditType('project'); setShowEditModal(true); }}
    />
  );

  const tabs = [
    { id: 'overview', label: 'Identity', icon: 'User' },
    { id: 'history', label: 'History', icon: 'Briefcase' },
    { id: 'academic', label: 'Academic', icon: 'GraduationCap' },
    { id: 'showcase', label: 'Showcase', icon: 'Layout' }
  ] as const;

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 150 }}>
        {/* 👤 Portfolio Header */}
        <View className="items-center pt-20 pb-12 px-8">
          <View className="w-40 h-40 rounded-[4rem] bg-primary p-1 shadow-2xl shadow-primary/20 mb-8">
            <View className="w-full h-full bg-background rounded-[3.8rem] overflow-hidden p-0.5">
              <Image 
                source={{ uri: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}` }} 
                className="w-full h-full rounded-[3.5rem]"
              />
            </View>
          </View>

          <View className="items-center gap-2 mb-6 text-center">
              <Text className="text-4xl font-black text-white tracking-tighter uppercase italic">{profile.name}</Text>
              <View className="flex-row items-center gap-2">
                  <Icon name="MapPin" size={12} color="#94a3b8" />
                  <Text className="text-slate-500 text-xs font-bold">{profile.department || 'Institutional Presence'}</Text>
              </View>
          </View>

          <View className="flex-row gap-4 w-full">
              <TouchableOpacity 
                  onPress={handleShare}
                  className="flex-[2] bg-white py-5 rounded-3xl flex-row items-center justify-center gap-3 shadow-2xl shadow-white/5"
              >
                  <Icon name="Share2" size={20} color="#0f172a" />
                  <Text className="text-background font-black text-xs uppercase tracking-widest">Share Hub</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                  onPress={() => logout()}
                  className="flex-1 bg-rose-500/10 border border-rose-500/20 rounded-3xl items-center justify-center"
              >
                  <Icon name="LogOut" size={20} color="#f43f5e" />
              </TouchableOpacity>
          </View>
        </View>

        {/* 📊 High-Signal Metrics */}
        <View className="flex-row px-8 gap-4 mb-10">
          {stats.map((stat) => (
            <GlassContainer key={stat.label} className="flex-1 p-6 items-center gap-2">
              <Icon name={stat.icon} size={20} color={stat.color} />
              <Text className="text-white text-2xl font-black tracking-tighter">{stat.value}</Text>
              <Text className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em]">{stat.label}</Text>
            </GlassContainer>
          ))}
        </View>

        {/* 📑 Hub Navigator */}
        <View className="px-5 mb-10">
          <GlassContainer className="p-1.5 flex-row border border-white/5">
            {tabs.map((t) => (
              <TouchableOpacity 
                key={t.id} 
                onPress={() => setActiveTab(t.id)} 
                className={`flex-1 py-4 items-center rounded-2xl ${activeTab === t.id ? 'bg-primary shadow-xl shadow-primary/20' : ''}`}
              >
                <Icon name={t.icon as any} size={16} color={activeTab === t.id ? 'white' : '#94a3b8'} />
              </TouchableOpacity>
            ))}
          </GlassContainer>
          <Text className="text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4">
              {activeTab} Domain
          </Text>
        </View>

        {/* 🎪 Dynamic Portfolio Hubs */}
        <View className="px-8">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'academic' && renderAcademic()}
          {activeTab === 'showcase' && renderShowcase()}
        </View>
      </ScrollView>

      <EditSectionModal 
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        type={editType}
        onUpdate={fetchProfile}
      />
    </View>
  );
};
