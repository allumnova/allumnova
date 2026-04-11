import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Icon } from './Icon';
import { GlassContainer } from './GlassContainer';
import { Post } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const [activeIndex, setActiveIndex] = useState(0);

  const typeIcons: any = {
    general: { name: 'Zap', color: '#6366f1' },
    opportunity: { name: 'Briefcase', color: '#10b981' },
    event: { name: 'Calendar', color: '#f59e0b' },
    achievement: { name: 'Trophy', color: '#8b5cf6' },
  };

  const activeIcon = typeIcons[post.type] || typeIcons.general;

  // Simulated Elite Images for Fluid Carousel
  const images = post.metadata?.images || [
    `https://picsum.photos/seed/${post.id}1/800/600`,
    `https://picsum.photos/seed/${post.id}2/800/600`,
    `https://picsum.photos/seed/${post.id}3/800/600`
  ];

  return (
    <GlassContainer className="p-0 mb-6 overflow-hidden">
      {/* 👤 Elite Header - DE-CLUTTERED */}
      <View className="px-6 py-5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-full bg-primary/20 p-0.5 shadow-sm shadow-primary/20">
            <Image 
              source={{ uri: post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}` }} 
              className="w-full h-full rounded-full"
            />
          </View>
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-white font-black text-[15px] tracking-tight">{post.author.name}</Text>
              <View className="w-1 h-1 rounded-full bg-primary/40" />
              <Text className="text-primary text-[9px] font-black uppercase tracking-widest">{post.author.tierLevel || 'ECHO'}</Text>
            </View>
            <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-[0.15em] mt-0.5 opacity-60">
              {post.author.department || 'Institutional Hub'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity className="p-2">
          <Icon name="MoreHorizontal" size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* 📝 Premium Content Area */}
      <View className="px-6 pb-4">
        <Text className="text-white/90 text-[15px] leading-6 font-medium">
          {post.content}
        </Text>
      </View>

      {/* 🖼️ Fluid Carousel Nexus */}
      <View className="relative">
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            setActiveIndex(Math.round(x / (SCREEN_WIDTH - 40))); // Approx width
          }}
          scrollEventThrottle={16}
        >
          {images.map((img: string, idx: number) => (
            <View key={idx} style={{ width: SCREEN_WIDTH - 50 }} className="h-64 px-1">
              <Image 
                source={{ uri: img }} 
                className="w-full h-full rounded-[2rem] bg-surface"
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>
        
        {/* Dot Indicators */}
        <View className="flex-row justify-center gap-1.5 mt-3 mb-1">
          {images.map((_: any, idx: number) => (
            <View 
              key={idx} 
              className={`h-1 rounded-full transition-all ${idx === activeIndex ? 'w-4 bg-primary' : 'w-1 bg-white/20'}`} 
            />
          ))}
        </View>
      </View>

      {/* 🌓 Interaction Hub */}
      <View className="px-6 py-6 border-t border-white/5 flex-row items-center justify-between">
        <View className="flex-row gap-8">
          <TouchableOpacity 
            onPress={() => onAppreciate(post.id)}
            className="flex-row items-center gap-2.5"
          >
            <Icon 
              name="Heart" 
              size={20} 
              color={post.hasAppreciated ? '#ef4444' : '#94a3b8'} 
              strokeWidth={post.hasAppreciated ? 0 : 2}
            />
            <Text className={`text-xs font-black ${post.hasAppreciated ? 'text-white' : 'text-textSecondary'}`}>
              {post._count.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => onDiscuss(post.id)}
            className="flex-row items-center gap-2.5"
          >
            <Icon name="MessageSquare" size={20} color="#94a3b8" />
            <Text className="text-xs font-black text-textSecondary">
              {post._count.comments}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => onBoost(post.id)}
          className={`flex-row items-center gap-2.5 px-5 py-2.5 rounded-2xl ${post.hasBoosted ? 'bg-primary/20 border border-primary/20' : 'bg-surface/50 border border-white/5 shadow-sm'}`}
        >
          <Icon 
            name="Zap" 
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
