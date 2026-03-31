import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert, Share } from "react-native";
import { useRouter } from "expo-router";
import {
  Heart,
  MessageCircle,
  Share2,
  Rocket,
  Zap,
  UserPlus,
  FileText,
  ChevronLeft,
  ChevronRight,
  Send,
  Calendar,
  Trophy,
  Briefcase,
  MoreHorizontal,
} from "lucide-react-native";
import { GlassView } from "./GlassView";

export interface Post {
  id: string;
  content: string;
  post_type?: "opportunity" | "event" | "achievement" | "general";
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    tierLevel?: string;
    reputationScore?: number;
  };
  media?: Array<{
    id: string;
    url: string;
    type: "image" | "video" | "pdf";
  }>;
  _count?: {
    likes: number;
    comments: number;
    boosts?: number;
  };
  hasAppreciated?: boolean;
  hasBoosted?: boolean;
  metadata?: any;
}

interface PostCardProps {
  post: Post;
  onAppreciate: (id: string) => void;
  onBoost: (id: string) => void;
  onDiscuss?: (id: string) => void;
}

const typeConfigs = {
  opportunity: {
    label: "Opportunity",
    color: "text-blue-400",
    icon: Briefcase,
    bgColor: "bg-blue-500/10",
  },
  event: {
    label: "Event",
    color: "text-emerald-400",
    icon: Calendar,
    bgColor: "bg-emerald-500/10",
  },
  achievement: {
    label: "Showcase",
    color: "text-amber-400",
    icon: Trophy,
    bgColor: "bg-amber-500/10",
  },
  general: {
    label: "Thought",
    color: "text-white/40",
    icon: FileText,
    bgColor: "bg-white/5",
  },
};

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onAppreciate,
  onBoost,
}) => {
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = post.media?.filter((m) => m.type === "image") || [];

  const config = typeConfigs[post.post_type || "general"] || typeConfigs.general;
  const IconComponent = config.icon;

  const handleShare = async () => {
    try {
      await Share.share({
        message: post.content,
        url: `https://allumnova.cloud/post/${post.id}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderMetadata = () => {
    if (!post.metadata || post.post_type === "general") return null;

    const data = post.metadata;

    if (post.post_type === "opportunity") {
      return (
        <View className="mt-4 p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20">
          <View className="flex-row items-center space-x-2 mb-2">
            <Briefcase size={16} color="#60A5FA" />
            <Text className="text-blue-100 font-bold ml-2">
              {data.role} @ {data.company}
            </Text>
          </View>
          <Text className="text-white/60 text-xs mb-4">
            {data.location || "Remote"}
          </Text>
          {data.applyLink && (
            <TouchableOpacity className="bg-blue-600 rounded-2xl py-3 items-center shadow-lg shadow-blue-500/40">
              <Text className="text-white font-bold">Apply Now</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (post.post_type === "event") {
        const eventDate = new Date(data.eventDate || Date.now());
      return (
        <View className="mt-4 p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex-row items-center">
          <View className="w-12 h-12 rounded-2xl bg-emerald-500/20 items-center justify-center border border-emerald-500/10">
            <Text className="text-[10px] font-bold text-emerald-400 uppercase">
              {eventDate.toLocaleString("default", { month: "short" })}
            </Text>
            <Text className="text-lg font-black text-emerald-400 leading-tight">
              {eventDate.getDate()}
            </Text>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-white font-bold">{data.eventTitle}</Text>
            <Text className="text-white/40 text-xs">{data.location}</Text>
          </View>
        </View>
      );
    }

    if (post.post_type === "achievement") {
      return (
        <View className="mt-4 p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-amber-500/20 items-center justify-center border-2 border-amber-500/20">
            <Trophy size={24} color="#FBBF24" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-amber-400 font-black uppercase tracking-wider text-xs">
              {data.title}
            </Text>
            <Text className="text-white/40 text-[10px] font-medium">
              Issued by: {data.issuedBy}
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <GlassView className="mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity 
            onPress={() => router.push({ pathname: "/profile/[id]", params: { id: post.author.id } })}
            className="w-10 h-10 rounded-full bg-accent items-center justify-center overflow-hidden"
          >
            {post.author.avatar ? (
              <Image source={{ uri: post.author.avatar }} className="w-full h-full" />
            ) : (
              <Text className="text-white font-bold">{post.author.name[0]}</Text>
            )}
          </TouchableOpacity>
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-white font-bold mr-2 truncate">{post.author.name}</Text>
              {post.author.tierLevel && (
                 <View className="bg-white/10 px-2 py-0.5 rounded-full border border-white/5">
                    <Text className="text-white/40 font-bold text-[8px] uppercase">{post.author.tierLevel}</Text>
                 </View>
              )}
            </View>
            <Text className="text-white/40 text-[10px]">
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <View className="absolute -top-6 right-0">
             <View className={`px-4 py-1.5 rounded-b-2xl ${config.bgColor} border-x border-b border-white/5 flex-row items-center`}>
                <IconComponent size={10} color={config.color.includes('blue') ? '#60A5FA' : config.color.includes('emerald') ? '#34D399' : config.color.includes('amber') ? '#FBBF24' : '#666'} />
                <Text className={`ml-1.5 text-[9px] font-bold uppercase tracking-wider ${config.color}`}>{config.label}</Text>
             </View>
        </View>
      </View>

      {/* Content */}
      <Text className="text-white/80 leading-6 text-[15px] mb-4">
        {post.content}
      </Text>

      {/* Media */}
      {images.length > 0 && (
        <View className="rounded-2xl overflow-hidden mb-4 bg-white/5 aspect-video relative">
          <Image 
            source={{ uri: images[activeImageIndex].url }} 
            className="w-full h-full" 
            resizeMode="cover"
          />
          {images.length > 1 && (
            <>
                <View className="absolute bottom-4 left-0 right-0 flex-row justify-center space-x-1">
                    {images.map((_, i) => (
                        <View key={i} className={`h-1.5 rounded-full ${i === activeImageIndex ? 'bg-white w-4' : 'bg-white/40 w-1.5'}`} />
                    ))}
                </View>
            </>
          )}
        </View>
      )}

      {renderMetadata()}

      {/* Footer / Interactions */}
      <View className="flex-row items-center justify-between border-t border-white/5 pt-4 mt-2">
        <View className="flex-row items-center space-x-6">
          <TouchableOpacity 
            onPress={() => onAppreciate(post.id)}
            className="flex-row items-center"
          >
            <Heart size={20} color={post.hasAppreciated ? "#FB7185" : "#666"} fill={post.hasAppreciated ? "#FB7185" : "none"} />
            <Text className={`ml-1.5 text-xs font-medium ${post.hasAppreciated ? 'text-rose-400' : 'text-white/40'}`}>
                {post._count?.likes || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center">
            <MessageCircle size={20} color="#666" />
            <Text className="ml-1.5 text-white/40 text-xs font-medium">
                {post._count?.comments || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare}>
            <Share2 size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
            onPress={() => onBoost(post.id)}
            className="flex-row items-center"
        >
          <Zap size={20} color={post.hasBoosted ? "#FBBF24" : "#666"} fill={post.hasBoosted ? "#FBBF24" : "none"} />
          <Text className={`ml-1.5 text-[10px] font-bold uppercase tracking-wider ${post.hasBoosted ? 'text-amber-400' : 'text-white/40'}`}>
            Boost
          </Text>
        </TouchableOpacity>
      </View>
    </GlassView>
  );
};
