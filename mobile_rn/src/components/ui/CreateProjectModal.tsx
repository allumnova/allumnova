import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Icon } from './Icon';
import api from '../../api/axios';
import { GlassContainer } from './GlassContainer';

export const CreateProjectModal = ({ visible, onClose, onRefresh }: { visible: boolean, onClose: () => void, onRefresh: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    tags: '',
    visibility: 'INSTITUTIONAL' as 'PUBLIC' | 'INSTITUTIONAL' | 'PRIVATE'
  });

  const handleCreate = async () => {
    if (!formData.title.trim()) return;
    setLoading(true);
    try {
      await api.post('/projects', {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setFormData({ title: '', tagline: '', description: '', tags: '', visibility: 'INSTITUTIONAL' });
      onRefresh();
      onClose();
    } catch (error) {
      console.error('[Launchpad] Creation Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white font-medium mb-5";
  const labelClass = "text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2 ml-1";

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose}
        className="flex-1 bg-background/95 items-center justify-end"
      >
        <TouchableOpacity activeOpacity={1} className="w-full">
          <GlassContainer className="p-8 rounded-t-[3rem] border-t border-white/10 h-[85%]">
            <View className="flex-row items-center justify-between mb-8">
              <View>
                <Text className="text-3xl font-black text-white italic uppercase tracking-tighter">New Initiate</Text>
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Founding institutional value</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-2 bg-white/5 rounded-full">
                <Icon name="X" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View>
                <Text className={labelClass}>Project Title</Text>
                <TextInput 
                   className={inputClass}
                   placeholder="e.g. Nexus Core"
                   placeholderTextColor="#475569"
                   value={formData.title}
                   onChangeText={t => setFormData({...formData, title: t})}
                />

                <Text className={labelClass}>Tagline</Text>
                <TextInput 
                   className={inputClass}
                   placeholder="The decentralized heartbeat of campus..."
                   placeholderTextColor="#475569"
                   value={formData.tagline}
                   onChangeText={t => setFormData({...formData, tagline: t})}
                />

                <Text className={labelClass}>Documented Description</Text>
                <TextInput 
                   className={`${inputClass} min-h-[120px] pt-4`}
                   placeholder="Define the scope and institutional impact..."
                   placeholderTextColor="#475569"
                   multiline
                   value={formData.description}
                   onChangeText={t => setFormData({...formData, description: t})}
                />

                <Text className={labelClass}>Tags (Comma Separated)</Text>
                <TextInput 
                   className={inputClass}
                   placeholder="AI, Blockchain, Hardware..."
                   placeholderTextColor="#475569"
                   value={formData.tags}
                   onChangeText={t => setFormData({...formData, tags: t})}
                />

                <Text className={labelClass}>Visibility Tier</Text>
                <View className="flex-row gap-2 mb-8">
                   {['PUBLIC', 'INSTITUTIONAL', 'PRIVATE'].map(v => (
                     <TouchableOpacity 
                        key={v}
                        onPress={() => setFormData({...formData, visibility: v as any})}
                        className={`flex-1 py-3 rounded-xl border items-center ${formData.visibility === v ? 'bg-primary/20 border-primary/40' : 'bg-white/5 border-white/5'}`}
                     >
                        <Text className={`text-[8px] font-bold uppercase tracking-widest ${formData.visibility === v ? 'text-white' : 'text-slate-500'}`}>{v}</Text>
                     </TouchableOpacity>
                   ))}
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleCreate}
                disabled={loading || !formData.title.trim()}
                className={`py-5 rounded-[2.5rem] items-center flex-row justify-center gap-3 ${formData.title.trim() ? 'bg-white shadow-2xl' : 'bg-surface opacity-50'}`}
              >
                {loading ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <>
                    <Text className="text-background font-black text-xs uppercase tracking-[0.2em]">Deploy Hub</Text>
                    <Icon name="Rocket" size={16} color="#0f172a" />
                  </>
                )}
              </TouchableOpacity>
              
              <View className="h-40" />
            </ScrollView>
          </GlassContainer>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
