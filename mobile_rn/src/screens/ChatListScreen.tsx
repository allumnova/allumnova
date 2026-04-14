import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { GlassContainer } from '../components/ui/GlassContainer';
import { useAuthStore } from '../store/useAuthStore';

export const ChatListScreen = ({ onSelectConversation }: { onSelectConversation: (conv: any) => void }) => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const [convRes, connRes] = await Promise.all([
        api.get('/chat/conversations'),
        api.get('/social/connections')
      ]);
      setConversations(convRes.data || []);
      setConnections(connRes.data || []);
    } catch (error) {
      console.error('[ChatList] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startNewChat = (targetUser: any) => {
    const existing = conversations.find(c => 
      c.users?.some((u: any) => u.id === (targetUser.userId || targetUser.id))
    );
    if (existing) {
      onSelectConversation(existing);
    } else {
      // Logic for new conversation initialization
      onSelectConversation({ id: null, users: [targetUser], messages: [] });
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.users?.[0]?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-background">
      <View className="p-6 pb-2">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Messages
          </Text>
          <TouchableOpacity className="w-12 h-12 bg-primary/20 rounded-2xl items-center justify-center border border-primary/30 shadow-lg shadow-primary/20">
            <Icon name="Plus" size={22} color="#3b82f6" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* 🔍 Search Nexus (Web Parity) */}
        <View className="relative mb-6">
          <View className="absolute left-5 top-4 z-10">
            <Icon name="Search" size={18} color="#475569" />
          </View>
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor="#475569"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="bg-surface border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-bold text-sm"
          />
        </View>

        {/* ⚡ Direct Connect (Web Logic) */}
        <View className="mb-6">
           <Text className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-4 ml-1">Direct Connect</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              <TouchableOpacity className="items-center mr-5 group">
                <View className="w-16 h-16 rounded-luxury bg-surface border border-dashed border-white/10 items-center justify-center mb-2">
                   <Icon name="Sparkles" size={24} color="#3b82f6" />
                </View>
                <Text className="text-[10px] font-bold text-slate-500">Find</Text>
              </TouchableOpacity>
              {connections.map((conn) => (
                <TouchableOpacity key={conn.id} onPress={() => startNewChat(conn)} className="items-center mr-5">
                   <View className="w-16 h-16 rounded-luxury border-2 border-primary/20 p-[2px] mb-2">
                      <View className="w-full h-full rounded-[2.2rem] bg-surface overflow-hidden border border-white/5">
                        {conn.avatar ? (
                          <Image source={{ uri: conn.avatar }} className="w-full h-full" />
                        ) : (
                          <View className="w-full h-full items-center justify-center bg-slate-800">
                             <Text className="text-white font-bold">{conn.name?.charAt(0)}</Text>
                          </View>
                        )}
                      </View>
                   </View>
                   <Text className="text-[10px] font-bold text-slate-400 max-w-[64px]" numberOfLines={1}>{conn.name?.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
           </ScrollView>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#3b82f6" size="large" className="mt-20" />
      ) : (
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <TouchableOpacity 
                key={conv.id || 'temp'} 
                onPress={() => onSelectConversation(conv)}
                className="mb-4"
              >
                <GlassContainer className="p-4 flex-row items-center gap-4 rounded-luxury">
                  <View className="relative">
                    <View className="w-16 h-16 rounded-luxury bg-surface items-center justify-center overflow-hidden border border-white/10">
                      {conv.users?.[0]?.avatar ? (
                        <Image source={{ uri: conv.users[0].avatar }} className="w-full h-full" />
                      ) : (
                        <Text className="text-xl font-bold text-slate-400">
                          {conv.users?.[0]?.name?.charAt(0)}
                        </Text>
                      )}
                    </View>
                    <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background shadow-sm" />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-white font-black text-sm uppercase tracking-tight">
                        {conv.users?.[0]?.name}
                      </Text>
                      <Text className="text-slate-500 text-[10px] font-bold">
                        {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:45 PM'}
                      </Text>
                    </View>
                    <Text className="text-slate-400 text-xs font-semibold" numberOfLines={1}>
                      {conv.messages?.[0]?.content || "Say hello! \uD83D\uDC4B"}
                    </Text>
                  </View>

                  <Icon name="ChevronRight" size={16} color="#475569" />
                </GlassContainer>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-20 items-center opacity-30">
              <Icon name="MessageCircle" size={64} color="#94a3b8" strokeWidth={1} />
              <Text className="text-white font-bold mt-4">No conversations found</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};
