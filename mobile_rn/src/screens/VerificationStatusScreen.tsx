import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from '../components/ui/Icon';
import { useAuthStore } from '../store/useAuthStore';
import { GlassContainer } from '../components/ui/GlassContainer';

export const VerificationStatusScreen = () => {
  const { user, logout } = useAuthStore();

  const isRejected = user?.status === 'REJECTED';

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-24 pb-12">
        {/* 🏛️ Branding */}
        <View className="mb-12">
          <Text className="text-4xl font-black text-primary tracking-tighter italic uppercase text-center">Allumnova</Text>
          <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 text-center">Institutional Verification</Text>
        </View>

        <GlassContainer className="p-10 border border-white/5 items-center">
          <View className={`w-24 h-24 rounded-[3rem] ${isRejected ? 'bg-rose-500/20' : 'bg-primary/20'} items-center justify-center mb-8`}>
            <Icon 
              name={isRejected ? 'AlertCircle' : 'Clock'} 
              size={48} 
              color={isRejected ? '#f43f5e' : '#6366f1'} 
            />
          </View>

          <Text className="text-white text-2xl font-black uppercase italic tracking-tighter text-center mb-4">
            {isRejected ? 'Verification Rejected' : 'Verification Pending'}
          </Text>

          <Text className="text-slate-400 text-sm font-medium leading-6 text-center mb-8">
            {isRejected 
              ? "We couldn't verify your institutional identity with the document provided. Please contact support or re-onboard."
              : "Your institutional pulse is being synchronized. An admin will verify your identity shortly to grant full access."}
          </Text>

          <View className="w-full gap-4">
            <TouchableOpacity className="w-full bg-white py-5 rounded-3xl items-center flex-row justify-center gap-3 shadow-2xl">
              <Text className="text-background font-black text-xs uppercase tracking-widest">Check Status</Text>
              <Icon name="RefreshCcw" size={16} color="#0f172a" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => logout()}
              className="w-full bg-rose-500/10 border border-rose-500/20 py-5 rounded-3xl items-center"
            >
              <Text className="text-rose-500 font-black text-xs uppercase tracking-widest">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </GlassContainer>

        <View className="mt-12 items-center">
          <View className="flex-row items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/5">
            <Icon name="Shield" size={12} color="#475569" />
            <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Secure Verification Tunnel</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
