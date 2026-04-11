import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { GlassContainer } from '../components/ui/GlassContainer';
import { useAuthStore } from '../store/useAuthStore';

export const ChatListScreen = ({ onSelectConversation }: { onSelectConversation: (conv: any) => void }) => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data || []);
    } catch (error) {
      console.error('[ChatList] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter(c => 
    c.users?.[0]?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-background p-6">
      <View className="flex-row items-center justify-between mb-8">
        <Text className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Messages
        </Text>
        <TouchableOpacity className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
          <Icon name="Plus" size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* 🔍 Search Nexus */}
      <View className="relative mb-8">
        <View className="absolute left-5 top-4 z-10">
          <Icon name="Search" size={18} color="#94a3b8" />
        </View>
        <TextInput
          placeholder="Locate connection..."
          placeholderTextColor="#475569"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="bg-surface/30 border border-white/5 rounded-3xl py-4 pl-14 pr-6 text-white font-bold text-sm"
        />
      </View>

      {loading ? (
        <ActivityIndicator color="#6366f1" size="large" className="mt-20" />
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <TouchableOpacity 
                key={conv.id} 
                onPress={() => onSelectConversation(conv)}
                className="mb-4"
              >
                <GlassContainer className="p-4 flex-row items-center gap-4">
                  <View className="relative">
                    <View className="w-14 h-14 rounded-2xl bg-surface items-center justify-center overflow-hidden border border-white/10">
                      {conv.users?.[0]?.avatar ? (
                        <Image source={{ uri: conv.users[0].avatar }} className="w-full h-full" />
                      ) : (
                        <Text className="text-xl font-bold text-slate-400">
                          {conv.users?.[0]?.name?.charAt(0)}
                        </Text>
                      )}
                    </View>
                    <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background" />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-white font-black text-sm uppercase tracking-tight">
                        {conv.users?.[0]?.name}
                      </Text>
                      <Text className="text-slate-500 text-[10px] font-bold">
                        {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </Text>
                    </View>
                    <Text className="text-slate-400 text-xs font-semibold" numberOfLines={1}>
                      {conv.messages?.[0]?.content || "No messages yet"}
                    </Text>
                  </View>

                  <Icon name="ChevronRight" size={16} color="#475569" />
                </GlassContainer>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-20 items-center opacity-30">
              <Icon name="MessageCircle" size={64} color="#94a3b8" strokeWidth={1} />
              <Text className="text-white font-bold mt-4">No conversations</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};
