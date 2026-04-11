import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import { GlassContainer } from './GlassContainer';
import { Post } from '../../types';

interface FeedCardProps {
  post: Post;
  onAppreciate: (id: string) => void;
  onBoost: (id: string) => void;
  onDiscuss: (id: string) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({ 
  post, 
  onAppreciate, 
  onBoost, 
  onDiscuss 
}) => {
  const typeIcons: any = {
    general: { name: 'Zap', color: '#6366f1' },
    opportunity: { name: 'Briefcase', color: '#10b981' },
    event: { name: 'Calendar', color: '#f59e0b' },
    achievement: { name: 'Trophy', color: '#8b5cf6' },
  };

  const activeIcon = typeIcons[post.type] || typeIcons.general;

  return (
    <GlassContainer className="p-6 mb-4">
      {/* 👤 Identity Hub */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-primary/20 p-0.5">
            <Image 
              source={{ uri: post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}` }} 
              className="w-full h-full rounded-full"
            />
          </View>
          <View>
            <Text className="text-white font-black text-sm tracking-tight">{post.author.name}</Text>
            <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest">
              {post.author.department || 'Member'}
            </Text>
          </View>
        </View>
        
        <View className="bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 flex-row items-center gap-1.5">
          <Icon name={activeIcon.name} size={12} color={activeIcon.color} />
          <Text className="text-white text-[10px] font-black uppercase tracking-widest opacity-80">
            {post.type}
          </Text>
        </View>
      </View>

      {/* 📝 Institutional Content */}
      <Text className="text-white/90 text-[15px] leading-6 mb-6 font-medium">
        {post.content}
      </Text>

      <View className="h-[1px] bg-white/5 mb-4" />

      {/* ⚡ Interaction Nexus */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row gap-6">
          <TouchableOpacity 
            onPress={() => onAppreciate(post.id)}
            className="flex-row items-center gap-2"
          >
            <Icon 
              name="Heart" 
              size={18} 
              color={post.hasAppreciated ? '#ef4444' : '#94a3b8'} 
              strokeWidth={post.hasAppreciated ? 0 : 2}
            />
            <Text className={`text-xs font-black ${post.hasAppreciated ? 'text-white' : 'text-textSecondary'}`}>
              {post._count.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => onDiscuss(post.id)}
            className="flex-row items-center gap-2"
          >
            <Icon name="MessageSquare" size={18} color="#94a3b8" />
            <Text className="text-xs font-black text-textSecondary">
              {post._count.comments}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => onBoost(post.id)}
          className={`flex-row items-center gap-2 px-4 py-2 rounded-xl ${post.hasBoosted ? 'bg-primary/20 border border-primary/40' : 'bg-surface/50 border border-white/5'}`}
        >
          <Icon 
            name="Rocket" 
            size={14} 
            color={post.hasBoosted ? '#6366f1' : '#94a3b8'} 
          />
          <Text className={`text-[10px] font-black uppercase tracking-widest ${post.hasBoosted ? 'text-primary' : 'text-textSecondary'}`}>
            {post.hasBoosted ? 'Boosted' : 'Boost'}
          </Text>
        </TouchableOpacity>
      </View>
    </GlassContainer>
  );
};
