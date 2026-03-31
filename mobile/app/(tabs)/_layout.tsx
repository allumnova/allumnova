import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import storage from '@/lib/storage';
import { Home, Users, Bell, User, MessageSquare, Search } from 'lucide-react-native';

export default function TabLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await storage.getItem('userToken');
      if (!token) {
        router.replace('/login');
      }
    };
    checkAuth();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#000',
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          color: '#fff',
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopWidth: 0.5,
          borderTopColor: '#121212',
          height: 65,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#4FC3F7',
        tabBarInactiveTintColor: '#666',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <Search size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Direct',
          tabBarIcon: ({ color }) => <MessageSquare size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
      {/* Hide original 'two' if it exists as a file but not in tabs */}
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
