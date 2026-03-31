import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { GlassView } from "@/components/GlassView";
import { Search, MapPin, Users, Star } from "lucide-react-native";

export default function DiscoverScreen() {
  return (
    <ScrollView className="flex-1 bg-black p-4">
      <View className="mb-8 px-2">
        <h1 className="text-white text-3xl font-black mb-2">Discover</h1>
        <Text className="text-white/40 text-sm">Explore colleges and alumni communities</Text>
      </View>

      <TouchableOpacity className="mb-6">
        <GlassView className="flex-row items-center p-4 bg-white/5 border-white/10">
          <Search size={20} color="#666" />
          <Text className="ml-3 text-white/40">Search colleges, people, or skills...</Text>
        </GlassView>
      </TouchableOpacity>

      <View className="mb-6 px-2">
        <Text className="text-white font-bold text-lg mb-4">Trending Communities</Text>
        {[1, 2, 3].map((i) => (
           <GlassView key={i} className="mb-3 p-4 border border-white/5">
              <View className="flex-row items-center">
                 <View className="w-12 h-12 rounded-2xl bg-accent/20 items-center justify-center">
                    <Star size={24} color="#4FC3F7" />
                 </View>
                 <View className="ml-4 flex-1">
                    <Text className="text-white font-bold">Techno Main Salt Lake</Text>
                    <View className="flex-row items-center mt-1">
                       <MapPin size={10} color="#666" />
                       <Text className="text-white/40 text-[10px] ml-1">Kolkata, WB</Text>
                       <View className="w-1 h-1 rounded-full bg-white/20 mx-2" />
                       <Users size={10} color="#666" />
                       <Text className="text-white/40 text-[10px] ml-1">2.4k Members</Text>
                    </View>
                 </View>
              </View>
           </GlassView>
        ))}
      </View>
    </ScrollView>
  );
}
