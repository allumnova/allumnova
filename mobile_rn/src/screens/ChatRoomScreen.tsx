import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { io } from 'socket.io-client';
import { Conversation, Message, User } from '../types';

export const ChatRoomScreen = ({ conversation, onBack }: { conversation: Conversation, onBack: () => void }) => {
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // 🎯 Recipient Intelligence: Identify who you're talking to
  const recipient = useMemo(() => {
    if (!conversation.users || conversation.users.length === 0) return null;
    return conversation.users.find((u: User) => u.id !== user?.id) || conversation.users[0];
  }, [conversation.users, user?.id]);

  useEffect(() => {
    // 🔌 Socket Connection Nexus (Synced with Web)
    const socketUrl = 'https://allumnova.cloud';

    socketRef.current = io(socketUrl, {
      query: { token, userId: user?.id },
      transports: ['websocket']
    });

    socketRef.current.on('new_message', (data: any) => {
      // Handle potential success wrapper from socket as well
      const incomingMsg: Message = data.data || data;
      if (incomingMsg.conversationId === conversation.id) {
        setMessages((prev: Message[]) => {
          // Prevent duplicates
          if (prev.some(m => m.id === incomingMsg.id)) return prev;
          return [...prev, incomingMsg];
        });
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [conversation.id, token, user?.id]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/messages/${conversation.id}`);
      // Un-wrap success logic: some endpoints return { success: true, data: [] }
      const rawData = res.data.data || res.data;
      const data: Message[] = Array.isArray(rawData) ? rawData : [];
      setMessages(data);
    } catch (error) {
      console.error('[ChatRoom] Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversation.id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !recipient) return;
    
    try {
      const msgData = {
        conversationId: conversation.id,
        receiverId: recipient.id,
        content: newMessage.trim()
      };
      
      const res = await api.post('/chat/messages', msgData);
      // Un-wrap success logic for saved message
      const savedMsg: Message = res.data.data || res.data;
      
      setMessages((prev: Message[]) => [...prev, savedMsg]);
      
      if (socketRef.current) {
        socketRef.current.emit('send_message', {
          receiverId: recipient.id,
          message: savedMsg
        });
      }
      setNewMessage('');
    } catch (error) {
      console.error('[ChatRoom] Send Error:', error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* 🏛️ Institutional Chat Header */}
      <View className="px-6 py-5 border-b border-white/5 flex-row items-center justify-between bg-surface/90 backdrop-blur-2xl">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={onBack} className="w-10 h-10 rounded-2xl bg-white/5 items-center justify-center">
            <Icon name="ChevronLeft" size={20} color="white" strokeWidth={3} />
          </TouchableOpacity>
          <View className="flex-row items-center gap-3">
             <View className="w-10 h-10 rounded-xl bg-blue-500/20 items-center justify-center border border-blue-500/30">
               {recipient?.avatar ? (
                 <Image source={{ uri: recipient.avatar }} className="w-full h-full rounded-xl" />
               ) : (
                 <Text className="text-blue-400 font-black">{recipient?.name?.charAt(0) || '?'}</Text>
               )}
             </View>
             <View>
                <Text className="text-white font-black text-sm uppercase tracking-tight">
                  {recipient?.name || 'Institutional Peer'}
                </Text>
                <View className="flex-row items-center gap-1.5">
                   <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                   <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                     Active Now
                   </Text>
                </View>
             </View>
          </View>
        </View>
        <TouchableOpacity className="p-2">
          <Icon name="Shield" size={18} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* 💬 Message Feed Nexus */}
      {loading ? (
        <View className="flex-1 items-center justify-center gap-4">
           <ActivityIndicator color="#3b82f6" size="large" />
           <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-[3px]">Loading History</Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-6 pt-6" 
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg: Message, idx: number) => {
            const isMe = msg.senderId === user?.id;
            return (
              <View key={msg.id || `msg-${idx}`} className={`mb-6 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                <View 
                  className={`max-w-[85%] px-5 py-4 rounded-luxury ${
                    isMe 
                      ? 'bg-primary rounded-tr-none shadow-xl shadow-primary/20' 
                      : 'bg-surface border border-white/5 rounded-tl-none shadow-lg'
                  }`}
                >
                  {msg.mediaUrl ? (
                    <View className="mb-3 rounded-2xl overflow-hidden shadow-inner bg-black/20">
                      <Image source={{ uri: msg.mediaUrl }} className="w-full h-40 object-cover" />
                    </View>
                  ) : null}
                  <Text className="text-white text-[13px] font-bold leading-5">
                    {msg.content}
                  </Text>
                  <View className="flex-row items-center justify-end gap-1.5 mt-2 opacity-40">
                    <Text className="text-[9px] font-black uppercase text-white">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {isMe && <Icon name="Check" size={10} color="white" />}
                  </View>
                </View>
              </View>
            );
          })}
          <View className="h-10" />
        </ScrollView>
      )}

      {/* ⌨️ Institutional Input Hub */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View className="px-6 py-6 bg-surface/95 border-t border-white/5 flex-row items-center gap-4 backdrop-blur-3xl">
          <TouchableOpacity className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
            <Icon name="Plus" size={20} color="#94a3b8" />
          </TouchableOpacity>
          
          <View className="flex-1 bg-background border border-white/5 rounded-luxury px-5 py-3.5 shadow-inner">
            <TextInput
              placeholder="Institutional Message..."
              placeholderTextColor="#475569"
              value={newMessage}
              onChangeText={setNewMessage}
              className="text-white font-bold text-sm"
              multiline
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity 
            onPress={sendMessage}
            disabled={!newMessage.trim()}
            className={`w-12 h-12 rounded-full items-center justify-center ${newMessage.trim() ? 'bg-primary shadow-2xl shadow-primary/40 scale-105' : 'bg-surface border border-white/5'}`}
          >
            <Icon name="Send" size={20} color={newMessage.trim() ? "white" : "#475569"} strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
