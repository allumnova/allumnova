import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Icon } from './Icon';
import api from '../../api/axios';
import { GlassContainer } from './GlassContainer';

export const CreatePostModal = ({ visible, onClose, onRefresh }: { visible: boolean, onClose: () => void, onRefresh: () => void }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'general' | 'opportunity' | 'event' | 'achievement'>('general');
  const [loading, setLoading] = useState(false);

  const postTypes = [
    { id: 'general', label: 'Thought', icon: 'MessageSquare', color: '#94a3b8' },
    { id: 'opportunity', label: 'Opportunity', icon: 'Briefcase', color: '#10b981' },
    { id: 'event', label: 'Event', icon: 'Calendar', color: '#3b82f6' },
    { id: 'achievement', label: 'Achievement', icon: 'Award', color: '#f59e0b' }
  ] as const;

  const handlePost = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await api.post('/feed', {
        content,
        post_type: type,
        visibility: 'college'
      });
      setContent('');
      onRefresh();
      onClose();
    } catch (error) {
      console.error('[CreatePost] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose}
        className="flex-1 bg-background/90 items-center justify-end"
      >
        <TouchableOpacity activeOpacity={1} className="w-full">
          <GlassContainer className="p-8 rounded-t-[3rem] border-t border-white/10 min-h-[70%]">
            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-2xl font-black text-white italic uppercase tracking-tighter">New Pulse</Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Icon name="X" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* 🎯 Type Nexus - 2x2 Grid for Symmetry */}
            <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
              {postTypes.map((pt) => (
                <TouchableOpacity 
                  key={pt.id}
                  onPress={() => setType(pt.id)}
                  style={{ width: '48%' }}
                  className={`p-4 rounded-2xl items-center gap-2 ${type === pt.id ? 'bg-primary/20 border border-primary/40' : 'bg-white/5 border border-white/5'}`}
                >
                  <Icon name={pt.icon as any} size={20} color={type === pt.id ? '#6366f1' : pt.color} />
                  <Text className={`text-[9px] font-black uppercase tracking-widest ${type === pt.id ? 'text-white' : 'text-slate-500'}`}>
                    {pt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ✍️ Content Zone */}
            <View className="bg-white/5 border border-white/10 rounded-[2rem] p-6 mb-8 min-h-[200px]">
              <TextInput
                placeholder="Share documented thoughts..."
                placeholderTextColor="#475569"
                value={content}
                onChangeText={setContent}
                multiline
                className="text-white font-bold text-sm leading-6"
                autoFocus
              />
            </View>

            <TouchableOpacity 
              onPress={handlePost}
              disabled={loading || !content.trim()}
              className={`py-5 rounded-[2rem] items-center flex-row justify-center gap-3 ${content.trim() ? 'bg-white shadow-2xl' : 'bg-surface opacity-50'}`}
            >
              {loading ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <>
                  <Text className="text-background font-black text-xs uppercase tracking-[0.2em]">Broadcast</Text>
                  <Icon name="Send" size={16} color="#0f172a" />
                </>
              )}
            </TouchableOpacity>

            <View className="h-20" />
          </GlassContainer>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
