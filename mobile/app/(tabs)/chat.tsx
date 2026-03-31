import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { GlassView } from "@/components/GlassView";
import api from "@/lib/api";
import { Search, Plus, MessageSquare } from "lucide-react-native";

interface Conversation {
  id: string;
  participants: any[];
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  _count?: {
    messages: number;
  };
}

export default function ChatListScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchConversations = async () => {
    try {
      const response = await api.get("/chat/conversations");
      setConversations(response.data || []);
    } catch (error) {
      console.error("Chat list error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherParticipant = item.participants?.[0] || { name: "Unknown" };
    return (
      <TouchableOpacity 
        onPress={() => router.push(`/chat/${item.id}`)}
        className="mb-3"
      >
        <GlassView className="p-4 py-3 flex-row items-center border border-white/5">
          <View className="w-12 h-12 rounded-full bg-accent items-center justify-center overflow-hidden">
            {otherParticipant.avatar ? (
              <Image source={{ uri: otherParticipant.avatar }} className="w-full h-full" />
            ) : (
              <Text className="text-white font-bold">{otherParticipant.name[0]}</Text>
            )}
          </View>
          <View className="ml-4 flex-1">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-white font-bold text-base">{otherParticipant.name}</Text>
              <Text className="text-white/40 text-[10px]">
                {item.lastMessage ? new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
              </Text>
            </View>
            <Text className="text-white/50 text-xs truncate" numberOfLines={1}>
              {item.lastMessage?.content || "No messages yet"}
            </Text>
          </View>
        </GlassView>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="#4FC3F7" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black p-4">
      <View className="flex-row items-center justify-between mb-6 px-2">
        <h1 className="text-white text-3xl font-black">Direct</h1>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20 opacity-40">
            <MessageSquare size={48} color="white" />
            <Text className="text-white text-lg mt-4 font-bold">No chats yet</Text>
            <Text className="text-white/60 text-center mt-2">Start a conversation with an alumnus!</Text>
          </View>
        }
      />
    </View>
  );
}
