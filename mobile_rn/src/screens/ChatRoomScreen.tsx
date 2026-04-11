import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { GlassContainer } from '../components/ui/GlassContainer';
import { io } from 'socket.io-client';

export const ChatRoomScreen = ({ conversation, onBack }: { conversation: any, onBack: () => void }) => {
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // 🔌 Socket Connection Nexus
    socketRef.current = io('https://allumnova.cloud', {
      query: { token },
      transports: ['websocket']
    });

    socketRef.current.on('new_message', (data: any) => {
      if (data.conversationId === conversation.id) {
        setMessages(prev => [...prev, data]);
      }
    });

    return () => socketRef.current.disconnect();
  }, [conversation.id]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/messages/${conversation.id}`);
      setMessages(res.data || []);
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
    if (!newMessage.trim()) return;
    try {
      const msgData = {
        conversationId: conversation.id,
        receiverId: conversation.users[0].id,
        content: newMessage
      };
      
      const res = await api.post('/chat/messages', msgData);
      setMessages(prev => [...prev, res.data]);
      socketRef.current.emit('send_message', {
        receiverId: conversation.users[0].id,
        message: res.data
      });
      setNewMessage('');
    } catch (error) {
      console.error('[ChatRoom] Send Error:', error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* 🏛️ Chat Header */}
      <View className="px-6 py-4 border-b border-white/5 flex-row items-center justify-between bg-surface/80">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={onBack} className="p-2">
            <Icon name="ArrowLeft" size={20} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-white font-black text-sm uppercase tracking-tight">
              {conversation.users[0].name}
            </Text>
            <Text className="text-emerald-500 text-[10px] font-bold uppercase">
              Online Now
            </Text>
          </View>
        </View>
        <TouchableOpacity className="p-2">
          <Icon name="MoreVertical" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* 💬 Message Feed */}
      {loading ? (
        <ActivityIndicator color="#6366f1" size="large" className="mt-20" />
      ) : (
        <ScrollView 
          className="flex-1 p-6" 
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            return (
              <View key={msg.id || idx} className={`mb-6 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                <View 
                  className={`max-w-[80%] p-4 rounded-3xl ${
                    isMe 
                      ? 'bg-primary rounded-tr-none' 
                      : 'bg-surface/50 border border-white/5 rounded-tl-none'
                  }`}
                >
                  <Text className="text-white text-sm font-medium leading-5">
                    {msg.content}
                  </Text>
                  <Text className={`text-[9px] mt-1 font-bold ${isMe ? 'text-white/50' : 'text-slate-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ⌨️ Input Nexus */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
        <View className="p-6 bg-surface/90 border-t border-white/5 flex-row items-center gap-4">
          <TouchableOpacity className="p-2">
            <Icon name="Paperclip" size={20} color="#94a3b8" />
          </TouchableOpacity>
          <View className="flex-1 bg-background/50 border border-white/5 rounded-2xl px-4 py-3">
            <TextInput
              placeholder="Message..."
              placeholderTextColor="#475569"
              value={newMessage}
              onChangeText={setNewMessage}
              className="text-white font-bold text-sm"
              multiline
            />
          </View>
          <TouchableOpacity 
            onPress={sendMessage}
            className={`w-12 h-12 rounded-full items-center justify-center ${newMessage.trim() ? 'bg-primary shadow-lg' : 'bg-surface'}`}
          >
            <Icon name="Send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
