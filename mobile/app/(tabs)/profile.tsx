import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import storage from "@/lib/storage";
import { GlassView } from "@/components/GlassView";
import { User, LogOut, Settings, Shield, Award } from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const data = await storage.getItem("userData");
      if (data) {
        setUserData(JSON.parse(data));
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await storage.removeItem("userToken");
          await storage.removeItem("userData");
          router.replace("/login");
        },
      },
    ]);
  };

  if (!userData) return null;

  return (
    <View className="flex-1 bg-black p-6">
      <View className="items-center mt-10 mb-10">
        <View className="w-24 h-24 rounded-full bg-accent items-center justify-center border-4 border-white/10">
          <Text className="text-white text-4xl font-bold">{userData.name[0]}</Text>
        </View>
        <Text className="text-white text-3xl font-bold mt-4 tracking-tighter">{userData.name}</Text>
        <Text className="text-white/40 text-lg">@{userData.username}</Text>
      </View>

      <GlassView className="mb-6">
        <View className="flex-row items-center mb-6">
          <Shield size={20} color="#4FC3F7" />
          <View className="ml-4">
            <Text className="text-white font-bold">Verification Level</Text>
            <Text className="text-accent text-xs font-bold">{userData.verificationLevel}</Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <Award size={20} color="#4FC3F7" />
          <View className="ml-4">
            <Text className="text-white font-bold">Reputation Score</Text>
            <Text className="text-accent text-xs font-bold">{userData.reputationScore} Points</Text>
          </View>
        </View>
      </GlassView>

      <TouchableOpacity 
        className="flex-row items-center bg-white/5 p-4 rounded-2xl mb-4 border border-white/10"
      >
        <Settings size={20} color="#666" />
        <Text className="text-white font-semibold ml-4">Account Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handleLogout}
        className="flex-row items-center bg-red-900/10 p-4 rounded-2xl border border-red-900/20"
      >
        <LogOut size={20} color="#EF4444" />
        <Text className="text-red-500 font-semibold ml-4">Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
