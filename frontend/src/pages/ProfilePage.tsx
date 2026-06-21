import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useCollege } from '../contexts/CollegeContext';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Settings, Shield, Award, Grid, UserPlus, User as UserIcon, MessageCircle, 
    Check, X, MapPin, Linkedin, Camera, Save, Sparkles, GraduationCap, 
    CheckCircle2, Search, Rocket, Filter, Globe, Download, Activity, Info 
} from 'lucide-react';
import { clsx } from 'clsx';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import ProjectCard from '../components/project/ProjectCard';
import { Post, Project } from '../types';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'posts' | 'projects' | 'about'>('posts');
    const [postType, setPostType] = useState<'all' | 'opportunity' | 'event' | 'achievement' | 'general'>('all');
    const [connectionLoading, setConnectionLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTab, setEditTab] = useState<'basic' | 'professional'>('basic');
    const [isMentorshipModalOpen, setIsMentorshipModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        linkedIn: '',
        avatar: '',
        department: '',
        role: '',
        username: '',
        isPublic: true,
        careerObjective: '',
        techSkills: {} as any,
        achievements: [] as string[],
        hobbies: [] as string[],
        resumeUrl: ''
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [showcaseProject, setShowcaseProject] = useState<any>(null);
    const [originalUsername, setOriginalUsername] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
    const [searchParams] = useSearchParams();
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
                    username: data.username || '',
                    isPublic: data.isPublic !== false,
                    careerObjective: data.careerObjective || '',
                    techSkills: data.techSkills || {},
                    achievements: data.achievements || [],
                    hobbies: data.hobbies || [],
                    resumeUrl: data.resumeUrl || ''
                });
                setOriginalUsername(data.username || '');
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        
        // Sync tab from URL deep-links
        const tab = searchParams.get('tab');
        if (tab && ['posts', 'projects', 'about'].includes(tab)) {
            setActiveTab(tab as any);
        }
    }, [userId, currentUser, searchParams]);

    // Username Availability Check
    useEffect(() => {
        const checkUsername = async () => {
            if (!editForm.username || editForm.username.length < 3) {
                setUsernameStatus('idle');
                return;
            }

            // If it's the same as the original, it's available
            if (editForm.username === originalUsername) {
                setUsernameStatus('available');
                return;
            }

            // Basic format check
            if (!/^[a-zA-Z0-9_]+$/.test(editForm.username)) {
                setUsernameStatus('invalid');
                return;
            }

            setUsernameStatus('checking');
            try {
                const res = await api.get(`/profile/check-username?username=${editForm.username}`);
                setUsernameStatus(res.data.data.available ? 'available' : 'taken');
            } catch (err) {
                console.error('Username check failed', err);
                setUsernameStatus('idle');
            }
        };

        const timeoutId = setTimeout(checkUsername, 500);
        return () => clearTimeout(timeoutId);
    }, [editForm.username, originalUsername]);

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
            formData.append('isPublic', String(editForm.isPublic));
            formData.append('careerObjective', editForm.careerObjective);
            formData.append('techSkills', JSON.stringify(editForm.techSkills));
            formData.append('achievements', JSON.stringify(editForm.achievements));
            formData.append('hobbies', JSON.stringify(editForm.hobbies));
            
            if (avatarFile) formData.append('avatar', avatarFile);
            if (resumeFile) formData.append('resume', resumeFile);

            await api.patch('/profile/me', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsEditing(false);
            setAvatarFile(null);
            setResumeFile(null);
            fetchProfile();
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const handleConnect = async () => {
        if (!profile) return;
        setConnectionLoading(true);
        try {
            if (profile.connectionStatus?.status === 'pending' && !profile.connectionStatus?.isSender) {
                await api.patch(`/social/connections/${profile.connectionStatus.id}`, { status: 'accepted' });
            } else {
                await api.post('/social/connections/request', { receiverId: profile.id });
            }
            fetchProfile();
        } catch (err) {
            console.error('Connection action failed:', err);
        } finally {
            setConnectionLoading(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setEditForm(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
        }
    };

    const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setResumeFile(file);
        }
    };

    const updateSkill = (category: string, value: string) => {
        setEditForm(prev => ({
            ...prev,
            techSkills: { ...prev.techSkills, [category]: value }
        }));
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Profile...</div>;
    if (!profile) return <div className="p-20 text-center">User not found.</div>;

    const stats = [
        { label: 'Impact', value: profile.reputationScore || 0, icon: Shield, color: 'text-blue-400' },
        { label: 'Posts', value: profile.posts?.length || 0, icon: Grid, color: 'text-slate-400' },
        { label: 'Showcase', value: profile.projects?.length || 0, icon: Rocket, color: 'text-purple-400' },
    ];

    return (
        <div className="space-y-8 pb-20 max-w-2xl mx-auto px-4 md:px-0">
            <header className="flex flex-col items-center text-center px-2">
                <div className="relative group mb-3 md:mb-5">
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2.5rem] md:rounded-[3.5rem] bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-0.5 md:p-1 shadow-xl shadow-blue-500/10 transition-transform group-hover:scale-105 duration-500">
                        <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[2.3rem] md:rounded-[3.2rem] overflow-hidden p-0.5">
                            <img src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} alt="" className="w-full h-full object-cover rounded-[2.2rem] md:rounded-[3.1rem]" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 w-full max-w-sm">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center gap-1.5">
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{profile.name}</h1>
                            {profile.is_verified && <CheckCircle2 size={18} className="text-blue-500 fill-blue-500/10 md:w-6 md:h-6" />}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <div className={`p-1 px-2 md:px-2.5 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-1 md:gap-1.5 shadow-sm ${getTierStyle(profile.tierLevel || 'Echo')}`}>
                                <Sparkles size={10} className="md:w-3 md:h-3" /> {profile.tierLevel || 'Echo'}
                            </div>
                            {profile.role === 'alumni' && (
                                <div className="p-1 px-2 md:px-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20 shadow-sm flex items-center gap-1">
                                    <GraduationCap size={10} className="md:w-3 md:h-3" /> Alumni
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] md:text-sm font-medium uppercase tracking-wider">
                        {profile.department || 'Allumnova Member'} {profile.batch_year ? `'${profile.batch_year.toString().slice(-2)}` : ''}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 md:gap-3 mt-6 md:mt-8 w-full font-bold">
                    {isOwnProfile ? (
                        <>
                            <button onClick={() => setIsEditing(true)} className="w-full sm:flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold py-3.5 md:py-4 rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95">
                                <Settings size={18} /> Edit Profile
                            </button>
                            <Link to={`/u/${profile.username || profile.id}`} className="w-full sm:flex-1 bg-blue-600/5 text-blue-600 dark:text-blue-400 font-extrabold py-3.5 md:py-4 rounded-xl md:rounded-2xl border border-blue-600/10 flex items-center justify-center gap-2 transition-all hover:bg-blue-600/10 active:scale-95">
                                <Globe size={18} /> Public URL
                            </Link>
                        </>
                    ) : (
                        <button 
                            onClick={handleConnect} 
                            disabled={connectionLoading || (profile.connectionStatus?.status === 'pending' && profile.connectionStatus?.isSender)}
                            className={`flex-[2] bg-blue-600 text-white font-extrabold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 ${connectionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {profile.connectionStatus?.status === 'pending' && !profile.connectionStatus?.isSender ? (
                                <Check size={18} />
                            ) : (
                                <UserPlus size={18} />
                            )}
                            {profile.connectionStatus?.status === 'pending' && !profile.connectionStatus?.isSender ? 'Accept Request' : 'Connect'}
                        </button>
                    )}
                    {!isOwnProfile && profile.role === 'alumni' && (
                        <button 
                            onClick={() => navigate('/scout', { state: { modelId: profile.id } })}
                            className="flex-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold py-4 rounded-2xl border border-blue-500/20 flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-all active:scale-95"
                            title="Blueprint this path"
                        >
                            <Activity size={18} /> Model Path
                        </button>
                    )}
                    {!isOwnProfile && (
                        <button onClick={() => navigate(`/chat?userId=${profile.id}`)} className="w-14 h-14 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300">
                            <MessageCircle size={18} />
                        </button>
                    )}
                </div>
            </header>

            {/* 🚀 Elite Showcase Gateway */}
            {isOwnProfile && (
                <div className="px-2">
                    <motion.button 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => navigate('/launchpad', { state: { openCreateModal: true } })}
                        className="w-full relative overflow-hidden rounded-[2.5rem] border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent p-8 text-left group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1 pr-6">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter mb-2 group-hover:text-blue-500 transition-colors">Elite Showcase</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed max-w-sm">
                                    Launch your next institutional milestone. Secure high-signal visibility across the college ecosystem.
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-600/40 group-hover:rotate-12 transition-transform duration-500">
                                <Rocket size={32} className="text-white" />
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2">
                            <span className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Start your showcase journey</span>
                            <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                <CheckCircle2 size={12} className="text-blue-500" />
                            </motion.div>
                        </div>
                    </motion.button>
                </div>
            )}

            <div className="grid grid-cols-3 gap-2.5 md:gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="glass-card p-4 md:p-5 flex flex-col items-center gap-0.5 md:gap-1 transition-transform hover:-translate-y-1">
                        <stat.icon size={18} className={`${stat.color} md:w-5 md:h-5`} />
                        <span className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</span>
                        <span className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider md:tracking-widest">{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center p-1 glass-card shadow-inner font-bold">
                {['posts', 'projects', 'about'].map((t) => (
                    <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-3 md:py-3.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-wider md:tracking-[0.15em] transition-all ${activeTab === t ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-md md:shadow-xl" : "text-slate-400 hover:text-slate-500"}`}>
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
                            profile.projects.map((project: Project, idx: number) => (
                                <ProjectCard 
                                    key={project.id} 
                                    project={project} 
                                    index={idx} 
                                    onUpdate={() => fetchProfile()} 
                                    onEdit={() => {}} 
                                    onShare={(p) => {
                                        setShowcaseProject(p);
                                        setIsPostModalOpen(true);
                                    }}
                                />
                            ))
                        ) : <div className="py-20 text-center opacity-40 uppercase tracking-widest text-xs font-bold">No projects showcased yet.</div>}
                    </motion.div>
                ) : (
                    <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {profile.careerObjective && (
                            <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-4 opacity-60">Career Objective</h4>
                                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic">"{profile.careerObjective}"</p>
                            </div>
                        )}
                        <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-10 text-center border border-slate-200 dark:border-white/5">
                            <UserIcon size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Member Details</h4>
                            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                                {profile.name} is a <span className="text-blue-500 font-bold uppercase">{profile.role}</span> from the <span className="text-slate-900 dark:text-white font-bold">{profile.department || 'General'}</span> branch.
                            </p>
                            {profile.resumeUrl && (
                                <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-transform hover:scale-105">
                                    <Download size={16} /> View Resume
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {createPortal(
                <AnimatePresence>
                    {isEditing && (
                        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-slate-200 dark:border-white/5 max-h-[90vh] flex flex-col">
                                <div className="p-8 flex flex-col h-full overflow-hidden">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight focus:outline-none">Edit Profile</h2>
                                        <button onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 transition-colors hover:text-red-500"><X size={20} /></button>
                                    </div>

                                    <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl mb-8">
                                        <button onClick={() => setEditTab('basic')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editTab === 'basic' ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-lg" : "text-slate-400"}`}>Basic Info</button>
                                        <button onClick={() => setEditTab('professional')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editTab === 'professional' ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-lg" : "text-slate-400"}`}>Professional Resume</button>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-6 flex-1 overflow-y-auto px-1 profile-scrollbar text-left">
                                        {editTab === 'basic' ? (
                                            <div className="space-y-6 pb-4">
                                                <div className="flex flex-col items-center">
                                                    <label className="cursor-pointer group relative">
                                                        <input type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                                        <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-slate-100 p-0.5 shadow-xl transition-all group-hover:scale-105">
                                                            <img src={editForm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editForm.name}`} className="w-full h-full object-cover rounded-[2.3rem]" alt="" />
                                                            <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                                <Camera size={24} className="text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl"><Camera size={16} /></div>
                                                    </label>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                                        <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white transition-all" />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Portfolio Tag (@username)</label>
                                                        <div className="relative">
                                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                                                            <input 
                                                                type="text" 
                                                                value={editForm.username} 
                                                                onChange={e => setEditForm({...editForm, username: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                                                                className={clsx(
                                                                    "w-full bg-slate-50 dark:bg-slate-950 border rounded-2xl py-4 pl-10 pr-12 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white transition-all",
                                                                    usernameStatus === 'available' ? "border-emerald-500/30" : 
                                                                    usernameStatus === 'taken' ? "border-rose-500/30" : 
                                                                    "border-slate-200 dark:border-white/10"
                                                                )} 
                                                            />
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                                {usernameStatus === 'checking' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                                                                {usernameStatus === 'available' && <CheckCircle2 size={16} className="text-emerald-500" />}
                                                                {usernameStatus === 'taken' && <X size={16} className="text-rose-500" />}
                                                                {usernameStatus === 'invalid' && <Info size={16} className="text-amber-500" />}
                                                            </div>
                                                        </div>
                                                        <p className="text-[9px] font-bold mt-1.5 ml-1 flex items-center gap-1">
                                                            {usernameStatus === 'available' ? (
                                                                <span className="text-emerald-500">Username available ✓</span>
                                                            ) : usernameStatus === 'taken' ? (
                                                                <span className="text-rose-500">Username is already taken.</span>
                                                            ) : (
                                                                <>
                                                                    <Globe size={10} className="text-slate-400" /> 
                                                                    <span className="text-slate-400">Sets your public URL: allumnova.cloud/u/{editForm.username || 'username'}</span>
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Member Type</label>
                                                            <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white appearance-none transition-all">
                                                                <option value="student">Student</option>
                                                                <option value="alumni">Alumni</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Branch / Dept</label>
                                                            <input type="text" placeholder="e.g. CSE" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bio</label>
                                                        <textarea rows={3} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white resize-none" />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">LinkedIn Profile</label>
                                                        <div className="relative">
                                                            <Linkedin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                            <input type="text" placeholder="https://linkedin.com/in/..." value={editForm.linkedIn} onChange={e => setEditForm({...editForm, linkedIn: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-5 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6 pb-6">
                                                <div className="flex items-center justify-between bg-blue-600/5 p-5 rounded-3xl border border-blue-600/10">
                                                    <div>
                                                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">Public Portfolio</h4>
                                                        <p className="text-[10px] text-slate-500 font-bold">Allow anyone with the link to see your resume.</p>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setEditForm({...editForm, isPublic: !editForm.isPublic})}
                                                        className={`w-14 h-8 rounded-full transition-all relative ${editForm.isPublic ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                                    >
                                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${editForm.isPublic ? 'left-7' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Career Objective</label>
                                                    <textarea rows={4} placeholder="Full-stack developer skilled in PHP, JS, and Python..." value={editForm.careerObjective} onChange={e => setEditForm({...editForm, careerObjective: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white resize-none" />
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 ml-1">Technical Skills Categories</label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {[
                                                            { key: 'Languages', label: 'Languages (PHP, JS, ...)' },
                                                            { key: 'Frameworks', label: 'Frameworks (React, Next...)' },
                                                            { key: 'Databases', label: 'Databases (SQL, NoSQL)' },
                                                            { key: 'APIs', label: 'APIs / Tools (Git, AWS)' },
                                                            { key: 'AI_ML', label: 'AI / ML (NLP, CNN)' },
                                                            { key: 'IoT', label: 'IoT / Embedded' }
                                                        ].map(cat => (
                                                            <div key={cat.key} className="space-y-1.5">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">{cat.label}</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={editForm.techSkills[cat.key] || ''} 
                                                                    onChange={e => updateSkill(cat.key, e.target.value)}
                                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-blue-500/50 text-slate-900 dark:text-white"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Achievements (Comma separated)</label>
                                                        <input type="text" placeholder="GDG Finalist, Hackathon Winner..." value={editForm.achievements.join(', ')} onChange={e => setEditForm({...editForm, achievements: e.target.value.split(',').map(s => s.trim())})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hobbies (Comma separated)</label>
                                                        <input type="text" placeholder="Robotics, Blogging, Fitness..." value={editForm.hobbies.join(', ')} onChange={e => setEditForm({...editForm, hobbies: e.target.value.split(',').map(s => s.trim())})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white" />
                                                    </div>
                                                </div>

                                                <div className="space-y-3 bg-blue-600/5 p-6 rounded-3xl border border-blue-600/10">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">PDF Resume Upload</label>
                                                    <input type="file" onChange={handleResumeChange} accept="application/pdf" className="text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer" />
                                                    {editForm.resumeUrl && <p className="text-[10px] text-emerald-500 font-bold italic">Current resume uploaded ✓</p>}
                                                </div>
                                            </div>
                                        )}

                                        <div className="sticky bottom-0 pt-6 pb-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row gap-3">
                                            <button 
                                                type="submit" 
                                                disabled={usernameStatus === 'taken' || usernameStatus === 'checking' || usernameStatus === 'invalid'}
                                                className="flex-2 bg-blue-600 disabled:opacity-50 text-white font-extrabold py-5 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                                            >
                                                <Save size={20} /> Save Changes
                                            </button>
                                            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold py-5 rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            <CreatePostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                onSuccess={() => {
                    setIsPostModalOpen(false);
                    fetchProfile();
                }}
                initialData={showcaseProject}
            />
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
