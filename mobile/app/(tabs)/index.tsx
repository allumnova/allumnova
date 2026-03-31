import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { GlassView } from "@/components/GlassView";
import { PostCard, Post } from "@/components/PostCard";
import api from "@/lib/api";
import { Zap, Briefcase, Calendar, Trophy, Plus, Star } from "lucide-react-native";

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  const postTypes = [
    { id: null, label: "All Feed", icon: Zap },
    { id: "opportunity", label: "Opportunities", icon: Briefcase },
    { id: "event", label: "Events", icon: Calendar },
    { id: "achievement", label: "Showcase", icon: Trophy },
  ];

  const fetchFeed = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get("/feed", {
        params: {
          limit: 10,
          type: activeType,
        },
      });
      const newPosts = response.data || [];
      setPosts(newPosts);
      
      if (newPosts.length > 0) {
        setCursor(newPosts[newPosts.length - 1].id);
        setHasNextPage(newPosts.length === 10);
      } else {
        setHasNextPage(false);
      }
      
      setErrorStatus(null);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setErrorStatus(403);
      } else {
        console.error("Feed error:", error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMore = async () => {
    if (fetchingMore || !hasNextPage || !cursor) return;

    setFetchingMore(true);
    try {
      const response = await api.get("/feed", {
        params: {
          cursor: cursor,
          limit: 10,
          type: activeType,
        },
      });
      const nextPosts = response.data || [];
      
      if (nextPosts.length > 0) {
        setPosts((prev) => [...prev, ...nextPosts]);
        setCursor(nextPosts[nextPosts.length - 1].id);
        setHasNextPage(nextPosts.length === 10);
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("Fetch more error:", error);
    } finally {
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [activeType]);

  const handleInteraction = async (postId: string, type: "appreciate" | "boost") => {
    // Optimistic Update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
            const field = type === 'appreciate' ? 'likes' : 'boosts';
            const hasField = type === 'appreciate' ? 'hasAppreciated' : 'hasBoosted';
            const isActive = !post[hasField as keyof Post];
            
            return {
              ...post,
              [hasField]: isActive,
              _count: {
                ...post._count,
                [field]: Math.max(0, (post._count?.[field as keyof NonNullable<Post['_count']>] || 0) + (isActive ? 1 : -1))
              }
            } as Post;
        }
        return post;
      })
    );

    try {
      await api.post("/feed/interact", { postId, type });
    } catch (err) {
      console.error(`Failed to ${type}:`, err);
      fetchFeed(); // Rollback
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="#4FC3F7" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Category Navigation */}
      <View className="pt-2 pb-4">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className="flex-row space-x-3"
        >
          {postTypes.map((type) => {
            const Icon = type.icon;
            const isActive = activeType === type.id;
            return (
              <TouchableOpacity
                key={type.label}
                onPress={() => {
                  setActiveType(type.id);
                  setCursor(null);
                }}
                className={`flex-row items-center px-6 py-3 rounded-full border mr-3 ${
                  isActive 
                    ? "bg-accent border-accent shadow-lg shadow-accent/40 scale-105" 
                    : "bg-white/5 border-white/10"
                }`}
              >
                <Icon size={16} color={isActive ? "white" : "#666"} />
                <Text className={`ml-2 text-xs font-bold ${isActive ? "text-white" : "text-white/40"}`}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {errorStatus === 403 ? (
        <View className="flex-1 justify-center p-8 items-center">
          <GlassView>
            <View className="items-center">
              <View className="w-16 h-16 bg-accent/20 rounded-3xl items-center justify-center mb-6">
                <Star size={32} color="#4FC3F7" />
              </View>
              <h2 className="text-white text-2xl font-bold mb-4 text-center">Membership Required</h2>
              <Text className="text-white/60 text-center leading-6 mb-8">
                You are not currently a member of any college. Please join your college community to view and interact with the alumni feed.
              </Text>
              <TouchableOpacity className="bg-accent rounded-2xl p-4 w-full items-center">
                <Text className="text-white font-bold">Find My College</Text>
              </TouchableOpacity>
            </View>
          </GlassView>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <PostCard 
              post={item} 
              onAppreciate={(id) => handleInteraction(id, "appreciate")}
              onBoost={(id) => handleInteraction(id, "boost")}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          onEndReached={fetchMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchFeed(true)} tintColor="#4FC3F7" />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20 px-8">
               <View className="w-20 h-20 rounded-[40px] bg-white/5 items-center justify-center mb-6">
                 <Star size={36} color="#666" />
               </View>
               <h3 className="text-white text-xl font-bold mb-2">No posts yet</h3>
               <Text className="text-white/40 text-center leading-5 text-sm">
                 Be the first to post in your community. Share updates, opportunities, and ideas!
               </Text>
            </View>
          }
          ListFooterComponent={fetchingMore ? (
            <ActivityIndicator color="#4FC3F7" className="py-8" />
          ) : null}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-10 right-8 w-16 h-16 bg-accent rounded-full items-center justify-center shadow-2xl shadow-accent/60"
      >
        <Plus size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}
