import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Icon } from '../components/ui/Icon';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { GlassContainer } from '../components/ui/GlassContainer';
import { User } from '../types';

type OnboardingStep = 1 | 2 | 3;

export const OnboardingScreen = () => {
    const { user, login } = useAuthStore();
    const [step, setStep] = useState<OnboardingStep>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1: Identity
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState('');
    const [linkedIn, setLinkedIn] = useState('');
    const [username, setUsername] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');

    // Step 2: College
    const [colleges, setColleges] = useState<any[]>([]);
    const [collegeSearch, setCollegeSearch] = useState('');
    const [selectedCollege, setSelectedCollege] = useState<any>(null);
    const [role, setRole] = useState<'STUDENT' | 'ALUMNI' | 'FACULTY'>('STUDENT');
    const [batch, setBatch] = useState('');

    // Step 3: Verification
    // (Actual document upload requires expo-image-picker)

    // Username Availability Check
    useEffect(() => {
        const checkUsernameValue = username?.trim().toLowerCase();
        
        // Self-Recognition Bypass: If user already owns this username, it's available
        if (checkUsernameValue && user?.username?.toLowerCase() === checkUsernameValue) {
            setUsernameStatus('available');
            return;
        }

        if (!checkUsernameValue || checkUsernameValue.length < 3) {
            setUsernameStatus('idle');
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(checkUsernameValue)) {
            setUsernameStatus('invalid');
            return;
        }

        const checkUsername = async () => {
            setUsernameStatus('checking');
            try {
                const res = await api.get(`/profile/check-username?username=${checkUsernameValue}`);
                setUsernameStatus(res.data.data.available ? 'available' : 'taken');
            } catch (err) {
                console.error('Username check failed', err);
                setUsernameStatus('idle');
            }
        };

        const timer = setTimeout(checkUsername, 500);
        return () => clearTimeout(timer);
    }, [username, user?.username]);

    // Fetch Colleges (Parity with Web)
    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const res = await api.get('/colleges');
                setColleges(res.data.data || []);
            } catch (err) {
                console.error('Fetch colleges failed', err);
            }
        };
        fetchColleges();
    }, []);

    const filteredColleges = colleges.filter(c => 
        c.name.toLowerCase().includes(collegeSearch.toLowerCase())
    );

    const handleOnboardingFinish = async () => {
        setLoading(true);
        setError('');
        try {
            const formData = {
                name,
                phone,
                linkedIn,
                username,
                collegeId: selectedCollege?.id,
                role: role.toLowerCase(),
                batch,
            };

            const res = await api.post('/profile/onboarding', formData);
            if (res.data.success) {
                const updatedUser = { 
                    ...user, 
                    ...res.data.data, 
                    isOnboarded: true, 
                    status: 'PENDING' 
                } as User;
                login(useAuthStore.getState().token || '', updatedUser);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Submission failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <View className="gap-6">
            <View className="mb-4">
                <Text className="text-2xl font-black text-white italic uppercase tracking-tighter">Identity Hub</Text>
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Define your institutional presence</Text>
            </View>

            <View className="gap-5">
                <View>
                    <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-2">Display Name</Text>
                    <TextInput 
                        className="bg-surface border border-white/5 rounded-2xl py-4 px-5 text-white font-bold text-sm shadow-inner"
                        placeholder="Full Name"
                        placeholderTextColor="#475569"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View>
                    <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-2">Unique Username</Text>
                    <View className="relative">
                         <TextInput 
                            className={`bg-surface border ${usernameStatus === 'available' ? 'border-emerald-500/40' : usernameStatus === 'taken' ? 'border-rose-500/40' : 'border-white/5'} rounded-2xl py-4 px-5 text-white font-bold text-sm`}
                            placeholder="username"
                            placeholderTextColor="#475569"
                            autoCapitalize="none"
                            value={username}
                            onChangeText={v => setUsername(v.toLowerCase())}
                        />
                        <View className="absolute right-4 top-1/2 -translate-y-1/2">
                            {usernameStatus === 'checking' && <ActivityIndicator size="small" color="#3b82f6" />}
                            {usernameStatus === 'available' && <Icon name="CheckCircle" size={16} color="#10b981" />}
                            {usernameStatus === 'taken' && <Icon name="XCircle" size={16} color="#f43f5e" />}
                            {usernameStatus === 'invalid' && <Icon name="AlertCircle" size={16} color="#f59e0b" />}
                        </View>
                    </View>
                    <Text className={`text-[9px] font-bold mt-2 ml-2 ${usernameStatus === 'available' ? 'text-emerald-500' : usernameStatus === 'taken' ? 'text-rose-500' : 'text-slate-600'}`}>
                        {usernameStatus === 'available' ? 'This institutional handle is yours!' : usernameStatus === 'taken' ? 'Handle already claimed.' : 'Use letters, numbers, and underscores.'}
                    </Text>
                </View>
            </View>

            <TouchableOpacity 
                disabled={!name || usernameStatus !== 'available'}
                onPress={() => setStep(2)}
                className={`py-5 rounded-luxury items-center flex-row justify-center gap-3 mt-4 ${(!name || (usernameStatus !== 'available' && username !== user?.username)) ? 'bg-surface opacity-40' : 'bg-primary shadow-2xl shadow-primary/40'}`}
            >
                <Text className="text-white font-black text-xs uppercase tracking-[2px]">Next Phase</Text>
                <Icon name="ChevronRight" size={18} color="white" strokeWidth={3} />
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View className="gap-6">
            <View className="mb-4">
                <Text className="text-2xl font-black text-white italic uppercase tracking-tighter">Institutional Core</Text>
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Connect with your campus hub</Text>
            </View>

            <View className="gap-5">
                <View>
                    <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-2">Search College</Text>
                    <View className="relative">
                        <View className="absolute left-5 top-4 z-10">
                            <Icon name="Search" size={18} color="#475569" />
                        </View>
                        <TextInput 
                            className="bg-surface border border-white/5 rounded-luxury py-4 px-5 pl-14 text-white font-bold text-sm"
                            placeholder="Campus name..."
                            placeholderTextColor="#475569"
                            value={collegeSearch}
                            onChangeText={setCollegeSearch}
                        />
                    </View>
                </View>

                {collegeSearch && !selectedCollege && (
                    <ScrollView className="max-h-40 bg-surface rounded-2xl border border-white/5 overflow-hidden">
                        {filteredColleges.map((c: any) => (
                            <TouchableOpacity 
                                key={c.id} 
                                onPress={() => { setSelectedCollege(c); setCollegeSearch(c.name); }}
                                className="p-4 border-b border-white/5 flex-row items-center gap-4"
                            >
                                <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center">
                                    <Icon name="Building2" size={16} color="#3b82f6" />
                                </View>
                                <View>
                                    <Text className="text-white text-xs font-black uppercase tracking-tight">{c.name}</Text>
                                    <Text className="text-slate-500 text-[9px] font-bold tracking-widest">{c.domain || 'Campus Link'}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {selectedCollege && (
                    <View className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-luxury flex-row items-center justify-between shadow-lg shadow-emerald-500/10">
                         <View className="flex-row items-center gap-3">
                            <Icon name="CheckCircle" size={18} color="#10b981" strokeWidth={2.5} />
                            <Text className="text-emerald-400 font-black text-xs uppercase tracking-tight">{selectedCollege.name}</Text>
                         </View>
                         <TouchableOpacity onPress={() => { setSelectedCollege(null); setCollegeSearch(''); }} className="p-1">
                             <Icon name="X" size={16} color="#475569" />
                         </TouchableOpacity>
                    </View>
                )}

                <View className="flex-row gap-4">
                    <View className="flex-[3]">
                         <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-2">Batch Year</Text>
                         <TextInput 
                            className="bg-surface border border-white/5 rounded-2xl py-4 px-5 text-white font-bold text-sm"
                            placeholder="e.g. 2024"
                            placeholderTextColor="#475569"
                            keyboardType="number-pad"
                            value={batch}
                            onChangeText={setBatch}
                        />
                    </View>
                </View>
            </View>

            <View className="flex-row gap-4 mt-6">
                <TouchableOpacity onPress={() => setStep(1)} className="flex-1 py-5 bg-surface border border-white/5 rounded-luxury items-center justify-center shadow-lg">
                    <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    disabled={!selectedCollege || !batch}
                    onPress={() => setStep(3)}
                    className={`flex-[2] py-5 rounded-luxury items-center flex-row justify-center gap-3 ${(!selectedCollege || !batch) ? 'bg-surface opacity-40' : 'bg-primary shadow-2xl shadow-primary/30'}`}
                >
                    <Text className="text-white font-black text-[10px] uppercase tracking-[2px]">Verify ID</Text>
                    <Icon name="ShieldCheck" size={18} color="white" strokeWidth={2.5} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View className="gap-6">
            <View className="mb-4">
                <Text className="text-2xl font-black text-white italic uppercase tracking-tighter">Institutional Trust</Text>
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Upload ID for campus verification</Text>
            </View>

            <TouchableOpacity 
                className="w-full h-56 border-2 border-dashed border-white/10 rounded-luxury bg-surface items-center justify-center gap-5 shadow-inner"
            >
                <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
                    <Icon name="Upload" size={28} color="#3b82f6" strokeWidth={2} />
                </View>
                <View className="items-center">
                    <Text className="text-white font-black text-xs uppercase tracking-[2px]">Select Document</Text>
                    <Text className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-widest">ID Card or Fee Receipt</Text>
                </View>
            </TouchableOpacity>

            <View className="flex-row gap-4 mt-6">
                <TouchableOpacity onPress={() => setStep(2)} className="flex-1 py-5 bg-surface border border-white/5 rounded-luxury items-center justify-center">
                    <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={handleOnboardingFinish}
                    className="flex-[2] py-5 bg-white rounded-luxury items-center flex-row justify-center gap-3 shadow-2xl shadow-white/10"
                >
                    <Text className="text-slate-950 font-black text-[10px] uppercase tracking-[2px]">Finish Setup</Text>
                    <Icon name="CheckCircle" size={18} color="#020617" strokeWidth={3} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            className="flex-1 bg-background"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View className="flex-1 px-8 pt-20 pb-12">
                     <View className="mb-12">
                        <Text className="text-4xl font-black text-primary tracking-tighter italic uppercase">Allumnova</Text>
                        <View className="flex-row gap-2 mt-4">
                            {[1, 2, 3].map(i => (
                                <View key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-primary' : 'bg-white/5'}`} />
                            ))}
                        </View>
                    </View>

                    <GlassContainer className="p-8">
                        {error ? (
                            <View className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-6">
                                <Text className="text-rose-400 text-center text-[10px] font-bold uppercase tracking-widest">{error}</Text>
                            </View>
                        ) : null}

                        {loading ? (
                            <View className="py-20 items-center justify-center gap-6">
                                <ActivityIndicator size="large" color="#6366f1" />
                                <Text className="text-slate-400 text-xs font-black uppercase tracking-widest">Initiating Presence...</Text>
                            </View>
                        ) : (
                            <View>
                                {step === 1 && renderStep1()}
                                {step === 2 && renderStep2()}
                                {step === 3 && renderStep3()}
                            </View>
                        )}
                    </GlassContainer>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
