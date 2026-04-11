import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { GlassContainer } from '../components/ui/GlassContainer';

export const MentorshipScreen = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/mentorship/requests');
      setRequests(res.data || []);
    } catch (error) {
      console.error('[Mentorship] Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      await api.patch('/mentorship/status', { requestId, status });
      fetchRequests();
    } catch (error) {
      console.error('[Mentorship] Update Error:', error);
    }
  };

  const isAlumni = user?.role === 'ALUMNI';

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      <View className="flex-row items-center gap-4 mb-8">
        <View className="p-3 bg-primary/20 rounded-2xl">
          <Icon name="Award" size={24} color="#6366f1" />
        </View>
        <Text className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Mentorship
        </Text>
      </View>

      <Text className="text-textSecondary font-medium leading-5 mb-8">
        {isAlumni 
          ? "Guide the next generation of innovators in your department." 
          : "Connect with industry-tested alumni to accelerate your path."}
      </Text>

      {loading ? (
        <ActivityIndicator color="#6366f1" size="large" className="mt-20" />
      ) : requests.length > 0 ? (
        <View className="gap-6">
          {requests.map((req) => (
            <GlassContainer key={req.id} className="p-6">
              <View className="flex-row items-center gap-4 mb-6">
                <View className="w-14 h-14 rounded-2xl bg-surface overflow-hidden border border-white/10">
                  <Image 
                    source={{ uri: (isAlumni ? req.student?.avatar : req.alumni?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${isAlumni ? req.student?.name : req.alumni?.name}` }}
                    className="w-full h-full"
                  />
                </View>
                <View>
                  <Text className="text-white font-black text-sm uppercase tracking-tight">
                    {isAlumni ? req.student?.name : req.alumni?.name}
                  </Text>
                  <Text className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">
                    {isAlumni ? req.student?.department : req.alumni?.department}
                  </Text>
                </View>
              </View>

              <View className="bg-background/40 p-4 rounded-2xl border border-white/5 mb-6">
                <Text className="text-slate-400 text-xs font-semibold italic">
                  "{req.message}"
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className={`px-3 py-1.5 rounded-full border ${
                  req.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20' :
                  req.status === 'accepted' ? 'bg-emerald-500/10 border-emerald-500/20' :
                  'bg-rose-500/10 border-rose-500/20'
                }`}>
                  <Text className={`text-[9px] font-black uppercase tracking-widest ${
                    req.status === 'pending' ? 'text-amber-500' :
                    req.status === 'accepted' ? 'text-emerald-500' :
                    'text-rose-500'
                  }`}>
                    {req.status}
                  </Text>
                </View>

                {req.status === 'pending' && isAlumni && (
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      onPress={() => handleStatusUpdate(req.id, 'accepted')}
                      className="bg-primary px-4 py-2 rounded-xl"
                    >
                      <Text className="text-white text-[10px] font-black uppercase">Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleStatusUpdate(req.id, 'declined')}
                      className="bg-surface px-4 py-2 rounded-xl"
                    >
                      <Text className="text-slate-400 text-[10px] font-black uppercase">Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </GlassContainer>
          ))}
        </View>
      ) : (
        <View className="py-20 items-center opacity-30">
          <Icon name="Target" size={64} color="#94a3b8" strokeWidth={1} />
          <Text className="text-white font-bold mt-4 text-center">No active tracks found</Text>
        </View>
      )}

      <View className="h-20" />
    </ScrollView>
  );
};
