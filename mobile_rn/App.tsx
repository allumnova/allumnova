import "./global.css";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Icon } from "./src/components/ui/Icon";
import { useAuthStore } from "./src/store/useAuthStore";

// Allumnova Professional Hubs
import { AuthScreen } from "./src/screens/AuthScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { VerificationStatusScreen } from "./src/screens/VerificationStatusScreen";
import { SocialFeedScreen } from "./src/screens/SocialFeedScreen";
import { LaunchpadScreen } from "./src/screens/LaunchpadScreen";
import { CareerHubScreen } from "./src/screens/CareerHubScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ChatListScreen } from "./src/screens/ChatListScreen";
import { ChatRoomScreen } from "./src/screens/ChatRoomScreen";
import { MentorshipScreen } from "./src/screens/MentorshipScreen";
import { ConnectionsScreen } from "./src/screens/ConnectionsScreen";

export default function App() {
  const { user, isAuthenticated, loading, setLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"feed" | "launchpad" | "career" | "profile" | "messages" | "mentorship" | "network">("feed");
  const [activeConversation, setActiveConversation] = useState<any | null>(null);

  useEffect(() => {
    // In a real app, we'd hydrate from AsyncStorage here.
    // For now, we'll just clear the loading state to allow the AuthScreen to show.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  // 🌍 Stage 1: Anonymous -> Authenticated
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-background">
        <StatusBar style="light" />
        <AuthScreen />
      </View>
    );
  }

  // 🌍 Stage 2: Authenticated -> Onboarded
  // Relaxed Gate: If user has a username, allow into the dashboard
  if (!user?.isOnboarded && !user?.username) {
    return (
      <View className="flex-1 bg-background">
        <StatusBar style="light" />
        <OnboardingScreen />
      </View>
    );
  }

  // 🌍 Stage 3: Onboarded -> Verified
  const isVerified = user?.is_verified || user?.verificationLevel?.toUpperCase() === 'VERIFIED' || user?.status === 'APPROVED' || user?.role === 'admin';
  if (!isVerified) {
    return (
      <View className="flex-1 bg-background">
        <StatusBar style="dark" />
        <VerificationStatusScreen />
      </View>
    );
  }

  const renderActiveHub = () => {
    // Sub-Screen logic
    if (activeConversation) {
      return <ChatRoomScreen 
        conversation={activeConversation} 
        onBack={() => setActiveConversation(null)} 
      />;
    }

    switch (activeTab) {
      case "feed": return <SocialFeedScreen />;
      case "launchpad": return <LaunchpadScreen />;
      case "career": return <CareerHubScreen />;
      case "profile": return <ProfileScreen />;
      case "messages": return <ChatListScreen onSelectConversation={setActiveConversation} />;
      case "mentorship": return <MentorshipScreen />;
      case "network": return <ConnectionsScreen />;
      default: return <SocialFeedScreen />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* 🏛️ Allumnova Professional Hub Nexus */}
      <View className="flex-1">
        {renderActiveHub()}
      </View>

      {/* 🪐 Institutional Bottom Nexus */}
      {!activeConversation && (
        <View className="absolute bottom-10 left-6 right-6 h-20 bg-surface/80 rounded-[2.5rem] border border-white/5 flex-row items-center justify-around px-4 shadow-2xl backdrop-blur-2xl">
          <TouchableOpacity onPress={() => setActiveTab("feed")} className="p-3">
            <Icon name="Zap" size={20} color={activeTab === "feed" ? "#6366f1" : "#94a3b8"} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setActiveTab("messages"); setActiveConversation(null); }} className="p-3">
            <Icon name="MessageSquare" size={20} color={activeTab === "messages" ? "#6366f1" : "#94a3b8"} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab("network")} className="p-3">
            <Icon name="Users" size={20} color={activeTab === "network" ? "#6366f1" : "#94a3b8"} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab("launchpad")} className="p-3">
            <Icon name="Rocket" size={20} color={activeTab === "launchpad" ? "#6366f1" : "#94a3b8"} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab("career")} className="p-3">
            <Icon name="Target" size={20} color={activeTab === "career" ? "#6366f1" : "#94a3b8"} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab("profile")} className="p-3">
            <Icon name="User" size={20} color={activeTab === "profile" ? "#6366f1" : "#94a3b8"} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
