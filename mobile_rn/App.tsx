import "./global.css";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, SafeAreaView, TouchableOpacity } from "react-native";
import { Icon } from "./src/components/ui/Icon";

// Allumnova Professional Hubs
import { SocialFeedScreen } from "./src/screens/SocialFeedScreen";
import { LaunchpadScreen } from "./src/screens/LaunchpadScreen";
import { CareerHubScreen } from "./src/screens/CareerHubScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";

export default function App() {
  const [activeTab, setActiveTab] = useState<"feed" | "launchpad" | "career" | "profile">("feed");

  const renderActiveHub = () => {
    switch (activeTab) {
      case "feed": return <SocialFeedScreen />;
      case "launchpad": return <LaunchpadScreen />;
      case "career": return <CareerHubScreen />;
      case "profile": return <ProfileScreen />;
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
      <View className="absolute bottom-8 left-6 right-6 h-16 bg-surface/80 rounded-3xl border border-white/5 flex-row items-center justify-around px-4 shadow-2xl backdrop-blur-xl">
        <TouchableOpacity onPress={() => setActiveTab("feed")} className="p-3">
          <Icon name="Zap" size={20} color={activeTab === "feed" ? "#6366f1" : "#94a3b8"} />
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
    </SafeAreaView>
  );
}
