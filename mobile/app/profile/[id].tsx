import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, MessageSquare, Shield, Award, MapPin } from "lucide-react-native";
import { GlassView } from "@/components/GlassView";
import { PostCard, Post } from "@/components/PostCard";
import api from "@/lib/api";

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/profile/${id}`);
        // Backend returns user data in response.data.data according to my check on controllers
        const profileData = response.data.data || response.data;
        setProfile(profileData);
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleAppreciate = async (postId: string) => {
    try {
      await api.post("/feed/interact", { postId, type: "appreciate" });
      // Optimized update: find post in profile.posts and update its count/state
      setProfile((prev: any) => {
        if (!prev) return prev;
        const updatedPosts = prev.posts.map((p: any) => {
          if (p.id === postId) {
            return {
              ...p,
              hasAppreciated: !p.hasAppreciated,
              _count: {
                ...p._count,
                likes: (p._count?.likes || 0) + (p.hasAppreciated ? -1 : 1),
              },
            };
          }
          return p;
        });
        return { ...prev, posts: updatedPosts };
      });
    } catch (error) {
      console.error("Appreciate error:", error);
    }
  };

  const handleBoost = async (postId: string) => {
    try {
      await api.post("/feed/interact", { postId, type: "boost" });
      setProfile((prev: any) => {
        if (!prev) return prev;
        const updatedPosts = prev.posts.map((p: any) => {
          if (p.id === postId) {
            return {
              ...p,
              hasBoosted: !p.hasBoosted,
              _count: {
                ...p._count,
                boosts: (p._count?.boosts || 0) + (p.hasBoosted ? -1 : 1),
              },
            };
          }
          return p;
        });
        return { ...prev, posts: updatedPosts };
      });
    } catch (error) {
      console.error("Boost error:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="#4FC3F7" size="large" />
      </View>
    );
  }

  if (!profile) return null;

  const posts = profile.posts || [];

  return (
    <ScrollView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 pt-12 pb-6 flex-row items-center border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl flex-1">Profile</Text>
      </View>

      <View className="items-center mt-8 mb-8 px-6">
        <View className="w-28 h-28 rounded-full bg-accent items-center justify-center border-4 border-white/10 overflow-hidden">
          {profile.avatar ? (
             <Image source={{ uri: profile.avatar }} className="w-full h-full" />
          ) : (
             <Text className="text-white text-5xl font-bold">{profile.name?.[0]}</Text>
          )}
        </View>
        <Text className="text-white text-3xl font-black mt-4 tracking-tighter text-center">{profile.name}</Text>
        <Text className="text-white/40 text-base">@{profile.username || profile.email?.split('@')[0]}</Text>
        
        <View className="flex-row items-center mt-2 opacity-60">
           <MapPin size={14} color="#666" />
           <Text className="text-white/60 ml-1 text-sm">{profile.location || 'Member of Allumnova'}</Text>
        </View>
      </View>

      <View className="flex-row justify-center space-x-4 mb-8 px-6">
          <TouchableOpacity 
            onPress={() => router.push({ pathname: "/chat/[id]", params: { id: profile.id } })}
            className="flex-1 bg-accent rounded-2xl py-4 flex-row items-center justify-center shadow-lg shadow-accent/40"
          >
            <MessageSquare size={20} color="white" />
            <Text className="text-white font-bold ml-2">Message</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 items-center justify-center">
            <Text className="text-white font-bold">Connect</Text>
          </TouchableOpacity>
      </View>

      <View className="px-6 space-y-4 mb-10">
        <GlassView className="mb-4">
          <View className="flex-row items-center mb-6">
            <Shield size={20} color="#4FC3F7" />
            <View className="ml-4">
              <Text className="text-white font-bold">Verification Level</Text>
              <Text className="text-accent text-xs font-bold uppercase">{profile.verificationLevel || 'Verified Alumnus'}</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Award size={20} color="#4FC3F7" />
            <View className="ml-4">
              <Text className="text-white font-bold">Reputation Score</Text>
              <Text className="text-accent text-xs font-bold">{profile.reputationScore || 0} Points</Text>
            </View>
          </View>
        </GlassView>

        <View className="mt-4 px-2">
            <Text className="text-white font-bold text-lg mb-2">About</Text>
            <Text className="text-white/60 leading-6">
               {profile.bio || "This alumnus hasn't shared a bio yet. Stay tuned for more updates on their professional journey!"}
            </Text>
        </View>

        {/* User's Posts */}
        <View className="mt-8">
            <Text className="text-white font-bold text-lg mb-6">Recent Activity</Text>
            {posts.length > 0 ? (
                posts.map((post: Post) => (
                    <PostCard 
                        key={post.id} 
                        post={post} 
                        onAppreciate={handleAppreciate}
                        onBoost={handleBoost}
                    />
                ))
            ) : (
                <View className="bg-white/5 rounded-3xl p-10 items-center justify-center border border-white/5">
                    <Text className="text-white/20 italic">No public posts yet.</Text>
                </View>
            )}
        </View>
      </View>
    </ScrollView>
  );
}
