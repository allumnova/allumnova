import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
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

const typeConfigs: Record<string, any> = {
  opportunity: { label: 'Opportunity', color: '#60a5fa', icon: 'Briefcase', bgColor: 'bg-blue-500/10', border: 'border-blue-500/20' },
  event: { label: 'Event', color: '#10b981', icon: 'Calendar', bgColor: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  achievement: { label: 'Achievement', color: '#f59e0b', icon: 'Trophy', bgColor: 'bg-amber-500/10', border: 'border-amber-500/20' },
  showcase: { label: 'Showcase', color: '#c084fc', icon: 'Rocket', bgColor: 'bg-purple-500/10', border: 'border-purple-500/20' },
  general: { label: 'Thought', color: '#94a3b8', icon: 'Zap', bgColor: 'bg-slate-500/10', border: 'border-slate-500/20' }
};

export const FeedCard = ({ 
  post, 
  onAppreciate, 
  onBoost, 
  onDiscuss 
}: FeedCardProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const config = typeConfigs[post.type] || typeConfigs.general;

  const renderMetadata = () => {
    const data = post.metadata;
    if (!data || post.type === 'general') return null;

    if (post.type === 'opportunity') {
      return (
        <View className="mt-4 p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-2xl bg-blue-500/20 items-center justify-center">
              <Icon name="Briefcase" size={18} color="#60a5fa" />
            </View>
            <View>
              <Text className="text-white text-xs font-black uppercase tracking-tight">{data.role}</Text>
              <Text className="text-blue-400 text-[10px] font-bold">@ {data.company}</Text>
            </View>
          </View>
          <TouchableOpacity className="w-full bg-blue-600 py-3 rounded-2xl items-center shadow-lg shadow-blue-500/20">
            <Text className="text-white font-black text-[10px] uppercase tracking-widest">Apply Now</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (post.type === 'event') {
      return (
        <View className="mt-4 p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex-row items-center gap-4">
          <View className="w-12 h-14 rounded-2xl bg-emerald-500/20 items-center justify-center border border-emerald-500/10">
             <Text className="text-[10px] font-black text-emerald-500 uppercase">
               {new Date(data.eventDate || Date.now()).toLocaleString('default', { month: 'short' })}
             </Text>
             <Text className="text-xl font-black text-emerald-400 leading-none">
               {new Date(data.eventDate || Date.now()).getDate()}
             </Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-xs font-black uppercase tracking-tight">{data.eventTitle}</Text>
            <View className="flex-row items-center gap-1.5 mt-1">
              <Icon name="MapPin" size={10} color="#94a3b8" />
              <Text className="text-textSecondary text-[10px] font-bold">{data.location || 'Institutional Hub'}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (post.type === 'achievement') {
      return (
        <View className="mt-4 p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex-row items-center gap-4">
          <View className="w-12 h-12 rounded-full bg-amber-500/20 items-center justify-center border-2 border-amber-500/20">
            <Icon name="Trophy" size={20} color="#f59e0b" />
          </View>
          <View className="flex-1">
            <Text className="text-amber-500 text-xs font-black uppercase tracking-wider">{data.title}</Text>
            <Text className="text-textSecondary text-[10px] font-bold opacity-60">Issued by: {data.issuedBy}</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  const images = post.metadata?.media?.filter((m: any) => m.type === 'image') || [];

  return (
    <GlassContainer className={`p-0 mb-6 overflow-hidden border ${config.border}`}>
      {/* 🎖️ Type Ribbon */}
      <View className={`absolute top-0 right-8 px-4 py-1 rounded-b-xl ${config.bgColor} flex-row items-center gap-1.5 border-x border-b ${config.border} z-20`}>
        <Icon name={config.icon} size={10} color={config.color} />
        <Text className="text-[9px] font-black uppercase tracking-wider" style={{ color: config.color }}>{config.label}</Text>
      </View>

      {/* 👤 Elite Header */}
      <View className="px-6 pt-7 pb-5 flex-row items-center justify-between">
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
        {renderMetadata()}
      </View>

      {/* 🖼️ Fluid Carousel Nexus */}
      {images.length > 0 && (
        <View className="relative mt-2">
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveIndex(Math.round(x / (SCREEN_WIDTH - 40)));
            }}
            scrollEventThrottle={16}
          >
            {images.map((img: any, idx: number) => (
              <View key={idx} style={{ width: SCREEN_WIDTH - 50 }} className="h-64 px-1">
                <Image 
                  source={{ uri: img.url }} 
                  className="w-full h-full rounded-[2.5rem] bg-surface"
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
          
          <View className="flex-row justify-center gap-2 mt-4 mb-4">
            {images.map((_: any, idx: number) => (
              <View 
                key={idx} 
                style={{
                  width: idx === activeIndex ? 18 : 6,
                  backgroundColor: idx === activeIndex ? '#6366f1' : 'rgba(255,255,255,0.2)',
                  height: 4,
                  borderRadius: 2
                }}
              />
            ))}
          </View>
        </View>
      )}

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
