import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { Post } from '../types';
import { FeedCard } from '../components/ui/FeedCard';
import { GlassContainer } from '../components/ui/GlassContainer';

export const SocialFeedScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [isGrowthMode, setIsGrowthMode] = useState(false);

  const postTypes = [
    { id: null, label: 'All Feed', icon: 'Zap' },
    { id: 'opportunity', label: 'Opportunities', icon: 'Briefcase' },
    { id: 'event', label: 'Events', icon: 'Calendar' },
    { id: 'achievement', label: 'Showcase', icon: 'Trophy' }
  ] as const;

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await api.get('/feed', {
        params: {
          type: activeType,
          productive: isGrowthMode,
          limit: 15
        }
      });
      setPosts(res.data || []);
    } catch (error) {
      console.error('[Social Nexus] Sync Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [activeType, isGrowthMode]);

  const handleInteraction = async (postId: string, type: 'appreciate' | 'boost') => {
    // Optimistic mobile update logic
    setPosts(current => current.map(p => {
      if (p.id === postId) {
        if (type === 'appreciate') {
          return {
            ...p,
            hasAppreciated: !p.hasAppreciated,
            _count: { ...p._count, likes: p._count.likes + (p.hasAppreciated ? -1 : 1) }
          };
        }
        if (type === 'boost') {
          return { ...p, hasBoosted: true };
        }
      }
      return p;
    }));

    try {
      await api.post('/feed/interact', { postId, type });
    } catch (err) {
      console.error(`[Social Nexus] Interaction Fail:`, err);
      fetchFeed(); // Rollback if necessary
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      {/* 🚀 Growth Mode Hub */}
      <GlassContainer className="p-6 mb-8 bg-primary/10 border-primary/20">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <View className="p-3 bg-primary rounded-2xl">
              <Icon name="Rocket" size={20} color="white" />
            </View>
            <View>
              <Text className="text-white font-black text-sm tracking-tight italic uppercase">Growth Mode</Text>
              <Text className="text-textSecondary text-[9px] font-black tracking-widest uppercase opacity-60">High-Signal Content Only</Text>
            </View>
          </View>
          <Switch 
            value={isGrowthMode} 
            onValueChange={setIsGrowthMode}
            trackColor={{ false: '#1e293b', true: '#6366f1' }}
            thumbColor={isGrowthMode ? '#ffffff' : '#94a3b8'}
          />
        </View>
      </GlassContainer>

      {/* 🧭 The Four Ovals */}
      <View className="mb-8 flex-row flex-wrap gap-2">
        {postTypes.map((type) => (
          <TouchableOpacity 
            key={type.label}
            onPress={() => setActiveType(type.id)}
            className={`flex-row items-center gap-2 px-6 py-3 rounded-full border ${activeType === type.id ? 'bg-primary border-primary shadow-xl shadow-primary/20' : 'bg-surface/50 border-white/5'}`}
          >
            <Icon name={type.icon as any} size={14} color={activeType === type.id ? 'white' : '#94a3b8'} />
            <Text className={`text-[10px] font-black uppercase tracking-widest ${activeType === type.id ? 'text-white' : 'text-textSecondary'}`}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ⚡ Social Feed */}
      {loading ? (
        <View className="mt-20">
          <ActivityIndicator color="#6366f1" size="large" />
        </View>
      ) : posts.length > 0 ? (
        <View>
          {posts.map(post => (
            <FeedCard 
              key={post.id} 
              post={post}
              onAppreciate={(id) => handleInteraction(id, 'appreciate')}
              onBoost={(id) => handleInteraction(id, 'boost')}
              onDiscuss={() => {}}
            />
          ))}
        </View>
      ) : (
        <View className="py-20 items-center justify-center opacity-40">
          <Icon name="Zap" size={64} color="#94a3b8" strokeWidth={1} />
          <Text className="text-white font-bold mt-4 uppercase tracking-widest text-[10px]">No high-signal posts active</Text>
        </View>
      )}

      <View className="h-24" />
    </ScrollView>
  );
};
