import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image } from 'react-native';
import { Icon } from './Icon';
import api from '../../api/axios';
import { GlassContainer } from './GlassContainer';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

export const CommentsModal = ({ visible, onClose, postId }: { visible: boolean, onClose: () => void, postId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/feed/comments/${postId}`);
      setComments(res.data || []);
    } catch (err) {
      console.error('[Social] Comment Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && postId) {
      fetchComments();
    }
  }, [visible, postId]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const res = await api.post('/feed/comments', { postId, content: newComment });
      setComments(prev => [res.data, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('[Social] Comment Post Error:', err);
    } finally {
      setPosting(false);
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
          <GlassContainer className="p-8 rounded-t-[3rem] border-t border-white/10 h-[80%]">
            <View className="flex-row items-center justify-between mb-8">
              <View>
                <Text className="text-2xl font-black text-white italic uppercase tracking-tighter">Discussion</Text>
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{comments.length} Signals Found</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-2 bg-white/5 rounded-full">
                <Icon name="X" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {loading ? (
                <View className="py-20">
                  <ActivityIndicator color="#6366f1" size="large" />
                </View>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <View key={comment.id} className="mb-6 flex-row gap-4">
                    <View className="w-10 h-10 rounded-full bg-surface overflow-hidden border border-white/5">
                      <Image 
                        source={{ uri: comment.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.name}` }}
                        className="w-full h-full"
                      />
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-white font-black text-xs">{comment.user?.name}</Text>
                            <Text className="text-slate-500 text-[8px] uppercase">{new Date(comment.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <Text className="text-slate-400 text-xs leading-5">{comment.content}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View className="py-20 items-center opacity-30">
                  <Icon name="MessageSquare" size={48} color="#94a3b8" strokeWidth={1} />
                  <Text className="text-white font-bold mt-4 uppercase tracking-[0.2em] text-[10px]">Be the first to project</Text>
                </View>
              )}
            </ScrollView>

            <View className="mt-6 flex-row items-center gap-3">
              <View className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary">
                <TextInput 
                   placeholder="Add a signal..."
                   placeholderTextColor="#475569"
                   value={newComment}
                   onChangeText={setNewComment}
                   className="text-white font-bold text-sm"
                   multiline
                />
              </View>
              <TouchableOpacity 
                onPress={handlePostComment}
                disabled={posting || !newComment.trim()}
                className={`w-14 h-14 rounded-2xl items-center justify-center ${newComment.trim() ? 'bg-primary' : 'bg-surface opacity-50'}`}
              >
                {posting ? <ActivityIndicator color="white" /> : <Icon name="Send" size={20} color="white" />}
              </TouchableOpacity>
            </View>

            <View className="h-20" />
          </GlassContainer>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
