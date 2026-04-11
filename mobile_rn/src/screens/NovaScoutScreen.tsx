import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { GlassContainer } from '../components/ui/GlassContainer';

export const NovaScoutScreen = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchScoutData = async () => {
    try {
      const res = await api.get('/scout/research');
      setData(res.data.data);
    } catch (error) {
      console.error('[NovaScout] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScoutData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#6366f1" size="large" />
        <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-4 animate-pulse">
          Parallel Signal Analysis...
        </Text>
      </View>
    );
  }

  const { peers, blueprints, archetype } = data || {};

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      {/* 🔮 Intelligence Header */}
      <GlassContainer className="p-8 mb-8 bg-slate-900 border border-primary/20">
        <View className="flex-row items-center gap-4 mb-6">
          <View className="p-3 bg-primary rounded-2xl">
            <Icon name="Activity" size={24} color="white" />
          </View>
          <View>
            <Text className="text-3xl font-black text-white italic uppercase tracking-tighter">
              Nova Scout
            </Text>
            <Text className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mt-1">
              Pure Intelligence
            </Text>
          </View>
        </View>
        
        <View className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl mb-6 flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Text className="text-slate-300 text-[10px] font-bold">
            Target Identification: <Text className="text-white">{archetype || 'Analyzing'}</Text>
          </Text>
        </View>

        <Text className="text-textSecondary text-xs font-semibold leading-5">
          We found peer clusters that are 1 step ahead and alumni blueprints that match your trajectory.
        </Text>
      </GlassContainer>

      {/* 🚀 Parallel Signals */}
      <View className="mb-8">
        <View className="flex-row items-center gap-3 mb-6">
          <Icon name="Sparkles" size={20} color="#f59e0b" />
          <Text className="text-xl font-black text-white uppercase tracking-tight italic">
            Parallel Signals
          </Text>
        </View>

        {peers?.length > 0 ? (
          <View className="gap-4">
            {peers.map((peer: any) => (
              <GlassContainer key={peer.id} className="p-6">
                <View className="flex-row items-center gap-4 mb-4">
                  <View className="w-16 h-16 rounded-2xl bg-surface overflow-hidden border border-white/10">
                    {peer.avatar ? <Image source={{ uri: peer.avatar }} className="w-full h-full" /> : <View className="w-full h-full items-center justify-center"><Text className="text-xl font-bold text-slate-500">{peer.name[0]}</Text></View>}
                  </View>
                  <View>
                    <Text className="text-white font-black text-sm uppercase tracking-tight">{peer.name}</Text>
                    <View className="bg-primary px-2 py-1 rounded-lg mt-1 w-fit">
                      <Text className="text-white text-[8px] font-black uppercase">
                        {peer.reputationScore} Rep • {peer.tierLevel}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity className="bg-white py-3 rounded-xl items-center shadow-xl">
                  <Text className="text-background font-black text-[10px] uppercase tracking-widest">
                    Inspect Path
                  </Text>
                </TouchableOpacity>
              </GlassContainer>
            ))}
          </View>
        ) : (
          <Text className="text-slate-500 text-center py-10">No parallel peers found.</Text>
        )}
      </View>

      <View className="h-20" />
    </ScrollView>
  );
};
