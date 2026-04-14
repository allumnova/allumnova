import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Icon } from '../components/ui/Icon';
import { UserCard } from '../components/ui/UserCard';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { User, ConnectionRequest } from '../types';

interface Connection {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  department?: string;
}

type ConnectionsTab = 'requests' | 'my' | 'discover';

export const ConnectionsScreen = () => {
  const [activeTab, setActiveTab] = useState<ConnectionsTab>('requests');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<{ incoming: ConnectionRequest[], outgoing: ConnectionRequest[] }>({ incoming: [], outgoing: [] });
  const [connections, setConnections] = useState<Connection[]>([]);
  const [discoverUsers, setDiscoverUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'requests') {
        const res = await api.get('/social/connect/pending');
        setPending({
          incoming: Array.isArray(res.data?.incoming) ? res.data.incoming : [],
          outgoing: Array.isArray(res.data?.outgoing) ? res.data.outgoing : []
        });
      } else if (activeTab === 'my') {
        const res = await api.get('/social/connections');
        setConnections(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'discover') {
        const res = await api.get('/social/discover');
        setDiscoverUsers(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('[Connections] Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await api.post('/social/connect/accept', { requestId });
      setPending((prev) => ({
        ...prev,
        incoming: prev.incoming.filter((r) => r.id !== requestId)
      }));
    } catch (err) {
      console.error('[Connections] Accept Error:', err);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await api.post('/social/connect/decline', { requestId });
      setPending((prev) => ({
        ...prev,
        incoming: prev.incoming.filter((r) => r.id !== requestId),
        outgoing: prev.outgoing.filter((r) => r.id !== requestId)
      }));
    } catch (err) {
      console.error('[Connections] Decline Error:', err);
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      await api.post('/social/connect', { receiverId: userId });
      setDiscoverUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error('[Connections] Connect Error:', err);
    }
  };

  const renderRequests = () => (
    <View className="gap-8">
      <View>
        <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[2px] mb-4 ml-2">Incoming Pulse</Text>
        {pending.incoming.length > 0 ? (
          pending.incoming.map((req) => (
            <UserCard 
              key={req.id}
              user={req.user}
              actionIcon="Check"
              actionColor="#10b981"
              actionLabel="Accept"
              secondaryIcon="X"
              secondaryAction={() => handleDecline(req.id)}
              onAction={() => handleAccept(req.id)}
            />
          ))
        ) : (
          <View className="py-12 items-center bg-surface rounded-luxury border border-dashed border-white/10">
            <Icon name="Clock" size={24} color="#475569" />
            <Text className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-widest">No incoming requests</Text>
          </View>
        )}
      </View>

      {pending.outgoing.length > 0 && (
        <View>
          <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[2px] mb-4 ml-2">Sent Invitations</Text>
          {pending.outgoing.map((req) => (
            <UserCard 
              key={req.id}
              user={req.user}
              actionIcon="Clock"
              actionColor="#94a3b8"
              actionLabel="Pending"
              secondaryIcon="Trash2"
              secondaryAction={() => handleDecline(req.id)}
              onAction={() => {}}
            />
          ))}
        </View>
      )}
    </View>
  );

  const renderMyConnections = () => (
    <View>
      {connections.length > 0 ? (
        connections.map((conn) => (
          <UserCard 
            key={conn.id}
            user={{ 
              id: conn.userId, 
              name: conn.name, 
              avatar: conn.avatar,
              department: conn.department 
            }}
            actionIcon="MessageSquare"
            actionLabel="Chat"
            actionColor="#3b82f6"
            onAction={() => {}}
          />
        ))
      ) : (
        <View className="py-20 items-center justify-center gap-6">
          <View className="w-24 h-24 bg-primary/10 rounded-luxury items-center justify-center border border-primary/20">
            <Icon name="Users" size={40} color="#3b82f6" strokeWidth={1.5} />
          </View>
          <View className="items-center">
            <Text className="text-white text-xl font-black italic uppercase tracking-tighter">Expand Your Circle</Text>
            <Text className="text-slate-500 text-xs mt-1 font-medium">Start connecting with your institutional peers</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setActiveTab('discover')}
            className="bg-primary px-10 py-4 rounded-2xl shadow-xl shadow-primary/30"
          >
            <Text className="text-white font-black text-[10px] uppercase tracking-widest">Explore Discovery</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderDiscover = () => (
    <View className="gap-6">
      <View className="relative">
        <View className="absolute left-5 top-4 z-10">
          <Icon name="Search" size={18} color="#475569" />
        </View>
        <TextInput 
          className="bg-surface border border-white/5 rounded-luxury py-4 px-5 pl-14 text-white font-bold text-sm"
          placeholder="Locate institutional peers..."
          placeholderTextColor="#475569"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {discoverUsers.length > 0 ? (
        discoverUsers
          .filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((u) => (
            <UserCard 
              key={u.id}
              user={u}
              onAction={() => handleConnect(u.id)}
              actionLabel="Connect"
              actionColor="#3b82f6"
            />
          ))
      ) : (
        <View className="py-20 items-center">
          <Icon name="Sparkles" size={48} color="#1e293b" />
          <Text className="text-slate-500 text-xs mt-4 font-bold uppercase tracking-widest">No new connections found</Text>
        </View>
      )}
    </View>
  );

  const tabs = [
    { id: 'requests', label: 'Requests', icon: 'Clock' },
    { id: 'my', label: 'Network', icon: 'Users' },
    { id: 'discover', label: 'Discover', icon: 'Sparkles' }
  ] as const;

  return (
    <View className="flex-1 bg-background pt-12">
      {/* 🧭 Tab Nexus */}
      <View className="px-8 mb-8">
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-3xl font-black text-white italic tracking-tighter uppercase">Network</Text>
          <View className="px-5 py-2.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-[2px]">{connections.length} Connected</Text>
          </View>
        </View>

        <View className="flex-row bg-surface rounded-luxury p-1.5 border border-white/5 shadow-2xl shadow-black/40">
          {tabs.map(t => (
            <TouchableOpacity 
              key={t.id}
              onPress={() => setActiveTab(t.id)}
              className={`flex-1 py-4 rounded-[1.8rem] items-center flex-row justify-center gap-2 ${activeTab === t.id ? 'bg-primary shadow-xl shadow-primary/30' : ''}`}
            >
              <Icon name={t.icon as any} size={15} color={activeTab === t.id ? 'white' : '#475569'} strokeWidth={activeTab === t.id ? 2.5 : 2} />
              <Text className={`text-[9px] font-black uppercase tracking-[2px] ${activeTab === t.id ? 'text-white' : 'text-slate-500'}`}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {loading ? (
          <View className="py-20">
            <ActivityIndicator color="#3b82f6" size="large" />
          </View>
        ) : (
          <>
            {activeTab === 'requests' && renderRequests()}
            {activeTab === 'my' && renderMyConnections()}
            {activeTab === 'discover' && renderDiscover()}
          </>
        )}
      </ScrollView>
    </View>
  );
};
