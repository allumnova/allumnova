import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Icon } from './Icon';
import api from '../../api/axios';
import { GlassContainer } from './GlassContainer';

interface MentorshipRequestModalProps {
  visible: boolean;
  onClose: () => void;
  alumniId: string;
  alumniName: string;
  onSuccess?: () => void;
}

export const MentorshipRequestModal: React.FC<MentorshipRequestModalProps> = ({ 
  visible, 
  onClose, 
  alumniId, 
  alumniName,
  onSuccess 
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError('');
    try {
      await api.post('/mentorship/request', { alumniId, message });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send request');
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
          <GlassContainer className="p-8 rounded-t-[3rem] border-t border-white/10 min-h-[60%]">
            <View className="flex-row items-center justify-between mb-8">
              <View>
                <Text className="text-2xl font-black text-white italic uppercase tracking-tighter">Request Mentorship</Text>
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Connecting with {alumniName}</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-2 bg-white/5 rounded-full">
                <Icon name="X" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex-row items-start gap-4 mb-6">
              <View className="p-2.5 bg-primary/10 rounded-xl">
                <Icon name="Award" size={20} color="#6366f1" />
              </View>
              <Text className="flex-1 text-slate-400 text-[10px] font-medium leading-4">
                Institutional growth is built on documentation. Explain your specific goals to increase acceptance odds.
              </Text>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-[2rem] p-6 mb-8 min-h-[150px]">
              <Text className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-3 ml-1">Your Message</Text>
              <TextInput
                placeholder="I am working on X and would love your advice on Y..."
                placeholderTextColor="#475569"
                value={message}
                onChangeText={setMessage}
                multiline
                className="text-white font-bold text-sm leading-6"
                autoFocus
              />
            </View>

            {error ? (
              <Text className="text-rose-400 text-center text-[10px] font-black uppercase tracking-widest mb-6">{error}</Text>
            ) : null}

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={loading || !message.trim()}
              className={`py-5 rounded-[2rem] items-center flex-row justify-center gap-3 ${message.trim() ? 'bg-white shadow-2xl' : 'bg-surface opacity-50'}`}
            >
              {loading ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <>
                  <Text className="text-background font-black text-xs uppercase tracking-widest">Send Request</Text>
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
