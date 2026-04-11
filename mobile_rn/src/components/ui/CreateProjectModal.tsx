import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Icon } from './Icon';
import api from '../../api/axios';
import { GlassContainer } from './GlassContainer';

export const CreateProjectModal = ({ visible, onClose, onRefresh }: { visible: boolean, onClose: () => void, onRefresh: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    repoUrl: '',
    demoUrl: '',
    lookingFor: '',
    shareToFeed: true
  });

  const handleLaunch = async () => {
    if (!form.title || !form.description) return;
    setLoading(true);
    try {
      await api.post('/projects', {
        ...form,
        milestones: ['Initial Idea', 'Prototype Build', 'Launch Hub Scaling']
      });
      onRefresh();
      onClose();
    } catch (error) {
      console.error('[CreateProject] Error:', error);
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
          <GlassContainer className="p-8 rounded-t-[3.5rem] border-t border-white/10 h-[85%]">
            <View className="flex-row items-center justify-between mb-8">
              <View className="flex-row items-center gap-3">
                <View className="p-2 bg-primary rounded-xl">
                    <Icon name="Rocket" size={16} color="white" />
                </View>
                <Text className="text-2xl font-black text-white italic uppercase tracking-tighter">Launch Initiative</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Icon name="X" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <View className="gap-6 pb-20">
                    <View>
                        <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Core Identity</Text>
                        <TextInput
                            placeholder="Initiative Title"
                            placeholderTextColor="#475569"
                            value={form.title}
                            onChangeText={(t) => setForm({...form, title: t})}
                            className="bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold"
                        />
                    </View>

                    <View>
                        <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Vision & Mission</Text>
                        <TextInput
                            placeholder="What problem are you solving?"
                            placeholderTextColor="#475569"
                            value={form.description}
                            onChangeText={(t) => setForm({...form, description: t})}
                            multiline
                            className="bg-white/5 border border-white/10 rounded-3xl py-4 px-6 text-white font-bold min-h-[120px]"
                        />
                    </View>

                    <View>
                        <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Connect Repository (Optional)</Text>
                        <TextInput
                            placeholder="GitHub / Bitbucket URL"
                            placeholderTextColor="#475569"
                            value={form.repoUrl}
                            onChangeText={(t) => setForm({...form, repoUrl: t})}
                            className="bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold"
                        />
                    </View>

                    <TouchableOpacity 
                        onPress={handleLaunch}
                        disabled={loading || !form.title || !form.description}
                        className={`py-6 rounded-[2.5rem] items-center flex-row justify-center gap-3 ${form.title && form.description ? 'bg-primary shadow-2xl' : 'bg-surface opacity-50'}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text className="text-white font-black text-xs uppercase tracking-[0.2em]">Ignite Engine</Text>
                                <Icon name="Zap" size={16} color="white" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
          </GlassContainer>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
