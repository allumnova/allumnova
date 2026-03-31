import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import storage from "@/lib/storage";
import { GlassView } from "@/components/GlassView";
import api from "@/lib/api";
import { LogIn } from "lucide-react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      // Store auth data securely
      await storage.setItem("userToken", token);
      await storage.setItem("userData", JSON.stringify(user));

      // Redirect to home
      router.replace("/(tabs)");
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed. Please check your credentials.";
      Alert.alert("Login Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center p-6"
      >
        <View className="items-center mb-12">
          <Text className="text-white text-5xl font-bold tracking-tighter">
            ALLUM<Text className="text-accent">NOVA</Text>
          </Text>
          <Text className="text-white/60 text-lg mt-2">Elevate Your Network</Text>
        </View>

        <GlassView>
          <Text className="text-white text-2xl font-semibold mb-6">Welcome Back</Text>

          <View className="space-y-4">
            <View>
              <Text className="text-white/40 text-sm mb-2 uppercase tracking-widest font-bold">Email Address</Text>
              <TextInput
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white"
                placeholder="Enter your email"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className="mt-4">
              <Text className="text-white/40 text-sm mb-2 uppercase tracking-widest font-bold">Password</Text>
              <TextInput
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white"
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="bg-accent rounded-2xl p-5 items-center mt-8 flex-row justify-center space-x-2 shadow-lg shadow-accent/50"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <LogIn size={20} color="white" />
                  <Text className="text-white font-bold text-lg">Sign In</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity className="mt-6 items-center">
              <Text className="text-white/40">Don't have an account? <Text className="text-accent font-bold">Sign Up</Text></Text>
            </TouchableOpacity>
          </View>
        </GlassView>
      </KeyboardAvoidingView>
    </View>
  );
}
