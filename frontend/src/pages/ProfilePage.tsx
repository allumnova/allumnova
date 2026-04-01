import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCollege } from '../contexts/CollegeContext';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, Award, Grid, Clock, UserPlus, User as UserIcon, MessageCircle, Check, X, Calendar, MapPin, Mail, Linkedin, Camera, Save, Sparkles, GraduationCap, CheckCircle2, Search, Rocket, Filter } from 'lucide-react';
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
        avatar: ''
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
                    avatar: data.avatar || ''
                });
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const handleConnect = async () => {
        if (!profile || connectionLoading) return;
        setConnectionLoading(true);
        try {
            await api.post('/social/connect', { receiverId: profile.id });
            fetchProfile(); // Refresh to update status
        } catch (err) {
            console.error('Connect failed:', err);
        } finally {
            setConnectionLoading(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            // Show preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
            };
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
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await api.patch('/profile/me', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setIsEditing(false);
            setAvatarFile(null);
            fetchProfile();
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 pb-10 animate-pulse px-4">
                <div className="flex flex-col items-center">
                    <div className="w-28 h-28 rounded-[2.5rem] bg-slate-200 dark:bg-slate-800 mb-4" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-40 mb-2" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-60" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800/40 rounded-3xl" />
                    ))}
                </div>
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800/40 rounded-3xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6">
                    <UserIcon size={32} className="text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">User not found</h2>
                <p className="text-slate-500 text-sm mb-6">The profile you're looking for doesn't exist or is unavailable.</p>
                <Link to="/" className="text-blue-500 font-bold hover:underline">Back to Feed</Link>
            </div>
        );
    }

    const stats = [
        { label: 'Impact', value: profile.reputationScore || 0, icon: Shield, color: 'text-blue-400' },
        { label: 'Posts', value: profile.posts?.length || 0, icon: Grid, color: 'text-slate-400' },
        { label: 'Showcase', value: profile.projects?.length || 0, icon: Rocket, color: 'text-purple-400' },
    ];

    const getStatusLabel = () => {
        if (!profile.connectionStatus) return 'Connect';
        const { status, isSender } = profile.connectionStatus;
        if (status === 'accepted') return 'Connected';
        if (status === 'pending') return isSender ? 'Pending' : 'Accept Request';
        return 'Connect';
    };

    return (
        <div className="space-y-8 pb-20 max-w-2xl mx-auto px-4 md:px-0">
            <header className="flex flex-col items-center text-center">
                <div className="relative group mb-4">
                    <div className="w-32 h-32 rounded-[3.5rem] bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-1 shadow-xl shadow-blue-500/10">
                        <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[3.2rem] overflow-hidden p-0.5">
                            <img
                                src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`}
                                alt={profile.name}
                                className="w-full h-full object-cover rounded-[3.1rem]"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{profile.name}</h1>
                        {profile.is_verified && (
                            <CheckCircle2 size={24} className="text-blue-500 fill-blue-500/10" />
                        )}
                        <div className={clsx(
                            "p-1 px-2.5 text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-1.5 shadow-sm",
                            getTierStyle(profile.tierLevel || 'Echo')
                        )}>
                            <Sparkles size={12} className="animate-pulse" />
                            {profile.tierLevel || 'Echo'}
                        </div>
                        {profile.role === 'admin' && (
                            <div className="p-1 px-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-rose-500/20 shadow-sm">Staff</div>
                        )}
                        {profile.role === 'alumni' && (
                            <div className="p-1 px-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20 shadow-sm flex items-center gap-1">
                                <GraduationCap size={12} />
                                Alumni
                            </div>
                        )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        {profile.department} {profile.batch_year ? `'${profile.batch_year.toString().slice(-2)}` : ''}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2 pt-1">
                        {Array.isArray(profile.colleges) && profile.colleges.map((mc: any) => (
                            <span key={mc.collegeId} className="text-[10px] font-bold text-blue-500 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-wider">
                                {mc.college.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-8 w-full">
                    {isOwnProfile ? (
                        <>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold py-4 rounded-2xl shadow-xl shadow-black/10 dark:shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Settings size={18} />
                                Edit Profile
                            </button>
                            <Link 
                                to="/discover"
                                className="flex-1 bg-blue-600 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Search size={18} />
                                Discover
                            </Link>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={handleConnect}
                                disabled={profile.connectionStatus?.status === 'pending' && profile.connectionStatus?.isSender}
                                className={clsx(
                                    "flex-1 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg",
                                    profile.connectionStatus?.status === 'accepted' 
                                        ? "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                                        : "bg-blue-600 text-white shadow-blue-500/20 active:scale-[0.98]"
                                )}
                            >
                                {profile.connectionStatus?.status === 'accepted' ? <Check size={18} /> : <UserPlus size={18} />}
                                {getStatusLabel()}
                            </button>
                            {profile.role === 'alumni' && (
                                <button 
                                    onClick={() => setIsMentorshipModalOpen(true)}
                                    className="flex-1 bg-amber-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <Award size={18} />
                                    Request Mentoring
                                </button>
                            )}
                            <button 
                                onClick={() => navigate(`/chat?userId=${profile.id}`)}
                                className="w-14 h-14 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-all shadow-sm"
                            >
                                <MessageCircle size={22} />
                            </button>
                        </>
                    )}
                </div>
            </header>
            
            <MentorshipRequestModal 
                isOpen={isMentorshipModalOpen}
                onClose={() => setIsMentorshipModalOpen(false)}
                alumniId={profile.id}
                alumniName={profile.name}
            />

            <div className="grid grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-slate-900/50 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-5 flex flex-col items-center gap-1 shadow-sm transition-transform hover:-translate-y-1">
                        <stat.icon size={20} className={stat.color} />
                        <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</span>
                    </div>
                ))}
            </div>
            
            {!isOwnProfile && profile.mutualCount > 0 && (
                <div className="flex items-center gap-3 px-6 py-4 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                    <div className="flex -space-x-2.5">
                        {Array.isArray(profile.mutualConnections) && profile.mutualConnections.map((m: any, i: number) => (
                            <div key={m.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-100 shrink-0 shadow-sm" style={{ zIndex: 3 - i }}>
                                <img src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} className="w-full h-full object-cover" alt="" />
                            </div>
                        ))}
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span className="text-blue-500">{profile.mutualCount}</span> Mutual connection{profile.mutualCount > 1 ? 's' : ''} including <span className="text-slate-900 dark:text-white">{Array.isArray(profile.mutualConnections) && profile.mutualConnections[0]?.name}</span>
                    </p>
                </div>
            )}

            {profile.bio && (
                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Award size={14} className="text-amber-500" />
                        Professional Bio
                    </h3>
                    <p className="text-slate-700 dark:text-slate-200 text-base leading-relaxed whitespace-pre-wrap font-medium">
                        {profile.bio}
                    </p>
                    {(profile.linkedIn || profile.location) && (
                        <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                            {profile.linkedIn && (
                                <a href={profile.linkedIn} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-xs font-bold">
                                    <Linkedin size={16} /> LinkedIn Profile
                                </a>
                            )}
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                <MapPin size={16} /> Campus Base
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center p-1.5 bg-slate-100 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[1.5rem] shadow-inner">
                {[
                    { id: 'posts', label: 'Feed Activity' },
                    { id: 'projects', label: 'Showcase' },
                    { id: 'about', label: 'About' }
                ].map((t) => (
                    <button 
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={clsx(
                            "flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                            activeTab === t.id ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xl" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'posts' ? (
                    <motion.div key="posts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Post Categories */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                            <Filter size={16} className="text-slate-400 shrink-0 ml-1" />
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'opportunity', label: 'Opportunities' },
                                { id: 'event', label: 'Events' },
                                { id: 'achievement', label: 'Achievements' },
                                { id: 'general', label: 'General' }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setPostType(cat.id as any)}
                                    className={clsx(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                                        postType === cat.id 
                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg" 
                                            : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-white/5"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {Array.isArray(profile.posts) && profile.posts.filter((p: any) => p && (postType === 'all' || p.post_type === postType)).length > 0 ? (
                            profile.posts
                                .filter((p: any) => p && (postType === 'all' || p.post_type === postType))
                                .map((post: Post) => (
                                    <PostCard 
                                        key={post.id} 
                                        post={post} 
                                        onAppreciate={() => {}} 
                                        onBoost={() => {}} 
                                    />
                                ))
                        ) : (
                            <div className="py-20 text-center bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10">
                                <Grid size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" strokeWidth={1.5} />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No {postType !== 'all' ? postType : ''} posts recorded</p>
                            </div>
                        )}
                    </motion.div>
                ) : activeTab === 'projects' ? (
                    <motion.div key="projects" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {Array.isArray(profile.projects) && profile.projects.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {profile.projects.map((project: Project, idx: number) => (
                                    <ProjectCard 
                                        key={project.id} 
                                        project={project} 
                                        index={idx} 
                                        onUpdate={() => fetchProfile()} 
                                        onEdit={() => {}}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10">
                                <Rocket size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" strokeWidth={1.5} />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No showcase initiatives yet</p>
                                {isOwnProfile && (
                                    <Link to="/launchpad" className="mt-4 inline-block text-blue-500 font-bold text-xs uppercase tracking-widest border-b border-blue-500 pb-1">Start your first journey</Link>
                                )}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-10 text-center border border-slate-200 dark:border-white/5">
                        <UserIcon size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" strokeWidth={1.5} />
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Member Metadata</h4>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                            {profile.name} is verified for the {profile.department} track at Allumnova.
                            Associated with the batch of {profile.batch_year}.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Profile Modal via Portal */}
            {createPortal(
                <AnimatePresence>
                    {isEditing && (
                        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsEditing(false)}
                                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-slate-200 dark:border-white/5 max-h-[95vh] flex flex-col"
                            >
                                <div className="p-8 overflow-y-auto flex-1">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Edit Profile</h2>
                                        <button onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="flex flex-col items-center mb-4">
                                            <div className="relative group">
                                                <label className="cursor-pointer group block">
                                                    <input 
                                                        type="file" 
                                                        onChange={handleAvatarChange}
                                                        className="hidden" 
                                                        accept="image/*"
                                                    />
                                                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-slate-200 dark:border-white/10 p-0.5 transition-transform group-hover:scale-[1.02]">
                                                        <img 
                                                            src={editForm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editForm.name}`} 
                                                            className="w-full h-full object-cover rounded-[2.3rem]"
                                                        />
                                                    </div>
                                                    <div className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-xl shadow-lg border-2 border-white dark:border-slate-900 transform transition-transform group-hover:scale-110">
                                                        <Camera size={14} />
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Display Name</label>
                                                <input 
                                                    type="text" 
                                                    value={editForm.name}
                                                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Professional Bio</label>
                                                <textarea 
                                                    rows={4}
                                                    value={editForm.bio}
                                                    onChange={e => setEditForm({...editForm, bio: e.target.value})}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white resize-none"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">LinkedIn URL</label>
                                                <div className="relative">
                                                    <Linkedin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input 
                                                        type="text" 
                                                        value={editForm.linkedIn}
                                                        onChange={e => setEditForm({...editForm, linkedIn: e.target.value})}
                                                        placeholder="https://linkedin.com/in/..."
                                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 pb-12 sm:pb-8 flex flex-col sm:flex-row gap-3 mt-auto">
                                            <button 
                                                type="submit"
                                                className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all order-1 sm:order-2"
                                            >
                                                <Save size={18} />
                                                Save Changes
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="w-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold py-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all order-2 sm:order-1"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        {/* Mobile safe area spacer */}
                                        <div className="h-8 sm:hidden" />
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
        case 'The Source': return 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400';
        case 'Frequency': return 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400';
        case 'Resonance': return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400';
        case 'Pulse': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400';
        case 'Echo': 
        default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400';
    }
};

const clsx = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default ProfilePage;
