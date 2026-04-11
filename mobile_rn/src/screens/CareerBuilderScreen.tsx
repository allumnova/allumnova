import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { GlassContainer } from '../components/ui/GlassContainer';
import { useAuthStore } from '../store/useAuthStore';

export const CareerBuilderScreen = () => {
  const { user } = useAuthStore();
  const [archetype, setArchetype] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const analyzeArchetype = async () => {
    try {
      const res = await api.get('/scout/archetype');
      setArchetype(res.data.archetype);
    } catch (error) {
      console.error('[CareerBuilder] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeArchetype();
  }, []);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      <View className="flex-row items-center gap-4 mb-8">
        <View className="p-3 bg-indigo-500/20 rounded-2xl">
          <Icon name="Target" size={24} color="#6366f1" />
        </View>
        <Text className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Career Hub
        </Text>
      </View>

      <GlassContainer className="p-8 mb-8 items-center bg-surface/40 border border-indigo-500/20">
        <View className="w-20 h-20 rounded-[2.5rem] bg-indigo-500 items-center justify-center shadow-2xl shadow-indigo-500/40 mb-6">
          <Icon name="Fingerprint" size={40} color="white" />
        </View>
        
        <Text className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">
          Your Identity Archetype
        </Text>
        
        {loading ? (
          <ActivityIndicator color="#6366f1" className="my-4" />
        ) : (
          <Text className="text-2xl font-black text-white uppercase italic text-center mb-4">
            {archetype || "Analyzing Signals"}
          </Text>
        )}

        <Text className="text-slate-400 text-xs font-semibold text-center leading-5">
          We've mapped your scattered interests into a unified professional signal. This archetype dictates your path.
        </Text>
      </GlassContainer>

      {/* 🛠️ Skills & Experience Nexus (Placeholder for future parity) */}
      <View className="gap-6">
        <GlassContainer className="p-6">
          <View className="flex-row items-center gap-3 mb-4">
            <Icon name="Zap" size={18} color="#6366f1" />
            <Text className="text-white font-black text-xs uppercase tracking-widest">Growth Vectors</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {(user?.interests || ['Design', 'Engineering', 'AI']).map((int: string) => (
              <View key={int} className="px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                <Text className="text-slate-300 text-[10px] font-bold uppercase">{int}</Text>
              </View>
            ))}
          </View>
        </GlassContainer>

        <TouchableOpacity className="bg-white py-5 rounded-[2rem] items-center shadow-2xl">
          <Text className="text-background font-black text-xs uppercase tracking-[0.2em]">Refine Signals</Text>
        </TouchableOpacity>
      </View>

      <View className="h-20" />
    </ScrollView>
  );
};
