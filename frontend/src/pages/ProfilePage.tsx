import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCollege } from '../contexts/CollegeContext';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, Award, Grid, UserPlus, User as UserIcon, MessageCircle, Check, X, MapPin, Linkedin, Camera, Save, Sparkles, GraduationCap, CheckCircle2, Search, Rocket, Filter } from 'lucide-react';
import PostCard from '../components/PostCard';
import MentorshipRequestModal from '../components/profile/MentorshipRequestModal';
import ProjectCard from '../components/project/ProjectCard';
import { Post, Project } from '../types';
import { createPortal } from 'react-dom';

const ProfilePage = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user: currentUser } = useAuth();
    
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'posts' | 'projects' | 'about'>('posts');
    const [postType, setPostType] = useState<'all' | 'opportunity' | 'event' | 'achievement' | 'general'>('all');
    const [connectionLoading, setConnectionLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isMentorshipModalOpen, setIsMentorshipModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        linkedIn: '',
        avatar: '',
        department: '',
        role: '',
        username: ''
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const isOwnProfile = !userId || userId === 'me' || userId === currentUser?.id;
    const targetId = isOwnProfile ? 'me' : userId;

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/profile/${targetId}`);
            const data = res.data.data;
            setProfile(data);
            if (isOwnProfile) {
                setEditForm({
                    name: data.name || '',
                    bio: data.bio || '',
                    linkedIn: data.linkedIn || '',
                    avatar: data.avatar || '',
                    department: data.department || '',
                    role: data.role || 'student',
                    username: data.username || ''
                });
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!profile || connectionLoading) return;
        setConnectionLoading(true);
        try {
            const { status, isSender, id: requestId } = profile.connectionStatus || {};
            
            if (status === 'pending' && !isSender) {
                // Accept instead
                await api.post('/social/connect/accept', { requestId });
            } else {
                // Send new request
                await api.post('/social/connect', { receiverId: profile.id });
            }
            fetchProfile();
        } catch (err) {
            console.error('Connection action failed:', err);
        } finally {
            setConnectionLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', editForm.name);
            formData.append('bio', editForm.bio);
            formData.append('linkedIn', editForm.linkedIn);
            formData.append('department', editForm.department);
            formData.append('role', editForm.role);
            formData.append('username', editForm.username);
            if (avatarFile) formData.append('avatar', avatarFile);

            await api.patch('/profile/me', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsEditing(false);
            setAvatarFile(null);
            fetchProfile();
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse">Loading Profile...</div>;
    if (!profile) return <div className="p-20 text-center">User not found.</div>;

    const stats = [
        { label: 'Impact', value: profile.reputationScore || 0, icon: Shield, color: 'text-blue-400' },
        { label: 'Posts', value: profile.posts?.length || 0, icon: Grid, color: 'text-slate-400' },
        { label: 'Showcase', value: profile.projects?.length || 0, icon: Rocket, color: 'text-purple-400' },
    ];

    return (
        <div className="space-y-8 pb-20 max-w-2xl mx-auto px-4 md:px-0">
            <header className="flex flex-col items-center text-center">
                <div className="relative group mb-4">
                    <div className="w-32 h-32 rounded-[3.5rem] bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-1 shadow-xl shadow-blue-500/10">
                        <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[3.2rem] overflow-hidden p-0.5">
                            <img src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} alt="" className="w-full h-full object-cover rounded-[3.1rem]" />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{profile.name}</h1>
                        {profile.is_verified && <CheckCircle2 size={24} className="text-blue-500 fill-blue-500/10" />}
                        <div className={`p-1 px-2.5 text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-1.5 shadow-sm ${getTierStyle(profile.tierLevel || 'Echo')}`}>
                            <Sparkles size={12} /> {profile.tierLevel || 'Echo'}
                        </div>
                        {profile.role === 'alumni' && (
                            <div className="p-1 px-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20 shadow-sm flex items-center gap-1">
                                <GraduationCap size={12} /> Alumni
                            </div>
                        )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        {profile.department || 'Allumnova Member'} {profile.batch_year ? `'${profile.batch_year.toString().slice(-2)}` : ''}
                    </p>
                </div>

                <div className="flex items-center gap-3 mt-8 w-full">
                    {isOwnProfile ? (
                        <button onClick={() => setIsEditing(true)} className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
                            <Settings size={18} /> Edit Profile
                        </button>
                    ) : (
                        <button 
                            onClick={handleConnect} 
                            disabled={connectionLoading || (profile.connectionStatus?.status === 'pending' && profile.connectionStatus?.isSender)}
                            className={`flex-1 bg-blue-600 text-white font-extrabold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 ${connectionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {profile.connectionStatus?.status === 'pending' && !profile.connectionStatus?.isSender ? (
                                <Check size={18} />
                            ) : (
                                <UserPlus size={18} />
                            )}
                            {profile.connectionStatus?.status === 'pending' && !profile.connectionStatus?.isSender ? 'Accept Request' : 'Connect'}
                        </button>
                    )}
                    {!isOwnProfile && (
                        <button onClick={() => navigate(`/chat?userId=${profile.id}`)} className="w-14 h-14 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300">
                            <MessageCircle size={18} />
                        </button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-slate-900/50 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-5 flex flex-col items-center gap-1 shadow-sm transition-transform hover:-translate-y-1">
                        <stat.icon size={20} className={stat.color} />
                        <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center p-1.5 bg-slate-100 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[1.5rem] shadow-inner font-bold">
                {['posts', 'projects', 'about'].map((t) => (
                    <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === t ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xl" : "text-slate-400"}`}>
                        {t}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'posts' ? (
                    <motion.div key="posts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {Array.isArray(profile.posts) && profile.posts.length > 0 ? (
                            profile.posts.map((post: Post) => <PostCard key={post.id} post={post} onAppreciate={() => {}} onBoost={() => {}} />)
                        ) : <div className="py-20 text-center opacity-40 uppercase tracking-widest text-xs font-bold">No feed activity yet.</div>}
                    </motion.div>
                ) : activeTab === 'projects' ? (
                    <motion.div key="projects" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {Array.isArray(profile.projects) && profile.projects.length > 0 ? (
                            profile.projects.map((project: Project, idx: number) => <ProjectCard key={project.id} project={project} index={idx} onUpdate={() => fetchProfile()} onEdit={() => {}} />)
                        ) : <div className="py-20 text-center opacity-40 uppercase tracking-widest text-xs font-bold">No projects showcased yet.</div>}
                    </motion.div>
                ) : (
                    <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-10 text-center border border-slate-200 dark:border-white/5">
                        <UserIcon size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Member Details</h4>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                            {profile.name} is a {profile.role} from the {profile.department || 'General'} branch.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {createPortal(
                <AnimatePresence>
                    {isEditing && (
                        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-slate-200 dark:border-white/5 max-h-[95vh] flex flex-col">
                                <div className="p-8 overflow-y-auto flex-1">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Edit Profile</h2>
                                        <button onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500"><X size={20} /></button>
                                    </div>
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="flex flex-col items-center mb-4">
                                            <label className="cursor-pointer group relative">
                                                <input type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                                <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-slate-200 p-0.5">
                                                    <img src={editForm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editForm.name}`} className="w-full h-full object-cover rounded-[2.3rem]" alt="" />
                                                </div>
                                                <div className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-xl shadow-lg"><Camera size={14} /></div>
                                            </label>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Display Name</label>
                                                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Portfolio Tag (@username)</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                                                    <input 
                                                        type="text" 
                                                        placeholder="unique-handle"
                                                        value={editForm.username} 
                                                        onChange={e => setEditForm({...editForm, username: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-9 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Member Type</label>
                                                    <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white appearance-none">
                                                        <option value="student">Student</option>
                                                        <option value="alumni">Alumni</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Branch / Dept</label>
                                                    <input type="text" placeholder="e.g. CSE" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bio</label>
                                                <textarea rows={3} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white resize-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">LinkedIn Profile</label>
                                                <div className="relative">
                                                    <Linkedin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input type="text" value={editForm.linkedIn} onChange={e => setEditForm({...editForm, linkedIn: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-6 pb-12 sm:pb-8 flex flex-col sm:flex-row gap-3">
                                            <button type="submit" className="flex-1 bg-blue-600 text-white font-extrabold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"><Save size={18} /> Save</button>
                                            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 dark:bg-white/5 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

const getTierStyle = (tier: string) => {
    switch (tier) {
        case 'The Source': return 'bg-purple-500/10 text-purple-600 border-purple-500/20 shadow-sm';
        case 'Frequency': return 'bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-sm';
        case 'Pulse': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-sm';
        default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20 shadow-sm';
    }
};

export default ProfilePage;
