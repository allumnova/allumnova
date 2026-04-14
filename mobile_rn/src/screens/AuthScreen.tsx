import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { GlassContainer } from '../components/ui/GlassContainer';

type AuthMode = 'login' | 'signup' | 'otp';

export const AuthScreen = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: email.toLowerCase(), password });
      if (res.data.success) {
        const { user, token } = res.data.data;
        login(token, user);
      } else {
        setError(res.data.error || 'Login failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !name) {
      setError('Please fill all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { email: email.toLowerCase(), password, name });
      if (res.data.success) {
        setMode('otp');
      } else {
        setError(res.data.error || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Account creation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: email.toLowerCase(), otp });
      if (res.data.success) {
        const { user, token } = res.data.data;
        login(token, user);
      } else {
        setError(res.data.error || 'Invalid code.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderLogin = () => (
    <View className="gap-5">
      <View className="relative">
        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Icon name="Mail" size={18} color="#94a3b8" />
        </View>
        <TextInput
          className="w-full bg-slate-800/40 border border-white/5 rounded-2xl py-4 px-5 pl-12 text-white font-medium"
          placeholder="Email address"
          placeholderTextColor="#64748b"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View className="relative">
        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Icon name="Lock" size={18} color="#94a3b8" />
        </View>
        <TextInput
          className="w-full bg-slate-800/40 border border-white/5 rounded-2xl py-4 px-5 pl-12 text-white font-medium"
          placeholder="Password"
          placeholderTextColor="#64748b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity 
        onPress={handleLogin}
        disabled={loading}
        className="w-full bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary/20"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-black text-xs uppercase tracking-widest">Sign In</Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center gap-1">
        <Text className="text-slate-400 text-xs">New to Allumnova?</Text>
        <TouchableOpacity onPress={() => setMode('signup')}>
          <Text className="text-primary font-bold text-xs">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSignup = () => (
    <View className="gap-5">
      <View className="relative">
        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Icon name="User" size={18} color="#94a3b8" />
        </View>
        <TextInput
          className="w-full bg-slate-800/40 border border-white/5 rounded-2xl py-4 px-5 pl-12 text-white font-medium"
          placeholder="Full Name"
          placeholderTextColor="#64748b"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View className="relative">
        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Icon name="Mail" size={18} color="#94a3b8" />
        </View>
        <TextInput
          className="w-full bg-slate-800/40 border border-white/5 rounded-2xl py-4 px-5 pl-12 text-white font-medium"
          placeholder="Email address"
          placeholderTextColor="#64748b"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View className="relative">
        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Icon name="Lock" size={18} color="#94a3b8" />
        </View>
        <TextInput
          className="w-full bg-slate-800/40 border border-white/5 rounded-2xl py-4 px-5 pl-12 text-white font-medium"
          placeholder="Password"
          placeholderTextColor="#64748b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity 
        onPress={handleSignup}
        disabled={loading}
        className="w-full bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary/20"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-black text-xs uppercase tracking-widest">Create Account</Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center gap-1">
        <Text className="text-slate-400 text-xs">Already an elite member?</Text>
        <TouchableOpacity onPress={() => setMode('login')}>
          <Text className="text-primary font-bold text-xs">Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOtp = () => (
    <View className="gap-5">
      <View className="text-center items-center mb-2">
        <Icon name="Key" size={32} color="#6366f1" />
        <Text className="text-white font-bold text-lg mt-4 text-center">Verification Required</Text>
        <Text className="text-slate-400 text-xs text-center mt-2 px-6">
          We've sent a 6-digit code to {email}.
        </Text>
      </View>

      <TextInput
        className="w-full bg-slate-800/40 border border-white/5 rounded-2xl py-6 px-5 text-white font-black text-3xl text-center tracking-[0.3em]"
        placeholder="000000"
        placeholderTextColor="#1e293b"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity 
        onPress={handleVerifyOtp}
        disabled={loading}
        className="w-full bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary/20"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-black text-xs uppercase tracking-widest">Verify & Access</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode('signup')} className="items-center">
        <Text className="text-slate-500 text-xs">Change Email</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-8 justify-center py-12">
          {/* 🏛️ Allumnova Branding */}
          <View className="mb-12">
            <Text className="text-4xl font-black text-primary tracking-tighter italic uppercase">Allumnova</Text>
            <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">
              {mode === 'login' ? 'Institutional Access' : mode === 'signup' ? 'Create Hub Presence' : 'Secure Verification'}
            </Text>
          </View>

          {/* 🪐 Auth Container */}
          <GlassContainer className="p-8 border border-white/5">
            {error ? (
              <View className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-6">
                <Text className="text-rose-400 text-center text-[10px] font-bold uppercase tracking-widest">
                  {error}
                </Text>
              </View>
            ) : null}

            {mode === 'login' && renderLogin()}
            {mode === 'signup' && renderSignup()}
            {mode === 'otp' && renderOtp()}
          </GlassContainer>

          <Text className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] text-center mt-12">
            Omnichannel Synchronized Platform
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
