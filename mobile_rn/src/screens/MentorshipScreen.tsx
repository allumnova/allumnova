import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { GlassContainer } from '../components/ui/GlassContainer';
import { MentorshipRequestModal } from '../components/ui/MentorshipRequestModal';
import { User } from '../types';

interface MentorshipRequest {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string;
  createdAt: string;
  student?: User;
  alumni?: User;
}

interface Mentor {
  id: string;
  name: string;
  avatar?: string;
  department?: string;
  tierLevel?: string;
  reputationScore: number;
  bio?: string;
}

type MentorshipTab = 'explore' | 'active';

export const MentorshipScreen = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<MentorshipTab>(user?.role === 'ALUMNI' ? 'active' : 'explore');
  const [items, setItems] = useState<(Mentor | MentorshipRequest)[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState<{ id: string, name: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'explore') {
        const res = await api.get<Mentor[]>('/mentorship/mentors');
        setItems(res.data || []);
      } else {
        const res = await api.get<MentorshipRequest[]>('/mentorship/requests');
        setItems(res.data || []);
      }
    } catch (error) {
      console.error('[Mentorship] Sync Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleStatusUpdate = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      await api.patch('/mentorship/status', { requestId, status });
      fetchData();
    } catch (error) {
      console.error('[Mentorship] Update Error:', error);
    }
  };

  const isAlumni = user?.role === 'ALUMNI';

  const renderMentorCard = (mentor: Mentor) => (
    <GlassContainer key={mentor.id} className="p-6 mb-4">
      <View className="flex-row items-center gap-4 mb-4">
        <View className="w-16 h-16 rounded-2xl bg-surface overflow-hidden border border-white/10">
          <Image 
            source={{ uri: mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}` }}
            className="w-full h-full"
          />
        </View>
        <View className="flex-1">
          <Text className="text-white font-black text-sm uppercase tracking-tight">{mentor.name}</Text>
          <Text className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">
            {mentor.department || 'Institutional Member'} • {mentor.tierLevel || 'Elite'}
          </Text>
        </View>
        <View className="items-center px-3 py-1 bg-white/5 rounded-xl border border-white/5">
            <Text className="text-white text-[10px] font-black">{mentor.reputationScore}</Text>
            <Text className="text-slate-500 text-[8px] uppercase">Score</Text>
        </View>
      </View>

      <Text className="text-slate-400 text-xs leading-5 mb-6" numberOfLines={2}>
        {mentor.bio || "Available for institutional guidance and career trajectory optimization."}
      </Text>

      <TouchableOpacity 
        onPress={() => setSelectedAlumni({ id: mentor.id, name: mentor.name })}
        className="bg-white py-4 rounded-xl items-center flex-row justify-center gap-2"
      >
        <Text className="text-background font-black text-[10px] uppercase tracking-widest">Request Mentorship</Text>
        <Icon name="ArrowRight" size={14} color="#0f172a" />
      </TouchableOpacity>
    </GlassContainer>
  );

  const renderRequestCard = (req: MentorshipRequest) => (
    <GlassContainer key={req.id} className="p-6 mb-4">
      <View className="flex-row items-center gap-4 mb-4">
        <View className="w-12 h-12 rounded-xl bg-surface overflow-hidden border border-white/10">
          <Image 
            source={{ uri: (isAlumni ? req.student?.avatar : req.alumni?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${isAlumni ? req.student?.name : req.alumni?.name}` }}
            className="w-full h-full"
          />
        </View>
        <View className="flex-1">
          <Text className="text-white font-black text-sm uppercase tracking-tight">
            {isAlumni ? req.student?.name : req.alumni?.name}
          </Text>
          <Text className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-0.5">
            {req.status} • {new Date(req.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View className="bg-background/40 p-4 rounded-xl border border-white/5 mb-4">
        <Text className="text-slate-400 text-xs italic font-medium">"{req.message}"</Text>
      </View>

      {req.status === 'pending' && isAlumni && (
        <View className="flex-row gap-2">
          <TouchableOpacity 
            onPress={() => handleStatusUpdate(req.id, 'accepted')}
            className="flex-1 bg-emerald-500/10 border border-emerald-500/20 py-3 rounded-xl items-center"
          >
            <Text className="text-emerald-500 text-[10px] font-black uppercase">Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleStatusUpdate(req.id, 'declined')}
            className="flex-1 bg-rose-500/10 border border-rose-500/20 py-3 rounded-xl items-center"
          >
            <Text className="text-rose-500 text-[10px] font-black uppercase">Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </GlassContainer>
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-8 pt-12" contentContainerStyle={{ paddingBottom: 150 }}>
        {/* 🧭 Stage Navigator */}
        <View className="flex-row items-center justify-between mb-8">
            <View>
                <Text className="text-3xl font-black text-white italic uppercase tracking-tighter">Mentorship</Text>
                <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Growth Protocol</Text>
            </View>
            <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center">
                <Icon name="Award" size={24} color="#6366f1" />
            </View>
        </View>

        <View className="flex-row bg-white/5 rounded-2xl p-1 mb-8">
            {(!isAlumni) && (
                <TouchableOpacity 
                    onPress={() => setActiveTab('explore')}
                    className={`flex-1 py-3.5 items-center rounded-xl ${activeTab === 'explore' ? 'bg-white' : ''}`}
                >
                    <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'explore' ? 'text-background' : 'text-slate-500'}`}>Explore</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity 
                onPress={() => setActiveTab('active')}
                className={`flex-1 py-3.5 items-center rounded-xl ${activeTab === 'active' ? 'bg-white' : ''}`}
            >
                <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'active' ? 'text-background' : 'text-slate-500'}`}>
                    {isAlumni ? 'Incoming' : 'My Requests'}
                </Text>
            </TouchableOpacity>
        </View>

        {activeTab === 'explore' && (
            <View className="mb-8 relative">
                <View className="absolute left-4 top-4 z-10">
                    <Icon name="Search" size={16} color="#475569" />
                </View>
                <TextInput 
                    placeholder="Search industry mentors..."
                    placeholderTextColor="#475569"
                    className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-bold text-sm"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        )}

        {loading ? (
          <ActivityIndicator color="#6366f1" size="large" className="mt-20" />
        ) : items.length > 0 ? (
          <View>
            {activeTab === 'explore' 
                ? items.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).map(renderMentorCard) 
                : items.map(renderRequestCard)}
          </View>
        ) : (
          <View className="py-20 items-center opacity-30">
            <Icon name="Target" size={64} color="#94a3b8" strokeWidth={1} />
            <Text className="text-white font-bold mt-4 text-center">No active tracks found</Text>
          </View>
        )}
      </ScrollView>

      {selectedAlumni && (
        <MentorshipRequestModal 
            visible={!!selectedAlumni}
            onClose={() => setSelectedAlumni(null)}
            alumniId={selectedAlumni.id}
            alumniName={selectedAlumni.name}
            onSuccess={fetchData}
        />
      )}
    </View>
  );
};
