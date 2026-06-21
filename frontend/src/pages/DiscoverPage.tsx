import React, { useState, useEffect } from 'react';
import { useCollege } from '../contexts/CollegeContext';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, Plus, Users, Sparkles, GraduationCap, UserPlus, Check, X, Filter, Rocket, Info, ChevronRight, Loader2, Globe, Shield, Lock } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ProposeHubModal from '../components/hub/ProposeHubModal';
import JoinRequestModal from '../components/project/JoinRequestModal';
import { useAuth } from '../contexts/AuthContext';

const DiscoverPage = () => {
    const { activeCollege, setActiveCollege } = useCollege();
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();

    const [tab, setTab] = useState<'people' | 'hubs' | 'colleges'>(
        (searchParams.get('tab') as any) || 'people'
    );
    
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [targetRoleQuery, setTargetRoleQuery] = useState('');
    const [batchFilter, setBatchFilter] = useState('');
    
    const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [selectedHub, setSelectedHub] = useState<any>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setRoleFilter(targetRoleQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, targetRoleQuery]);

    // 1. Suggested Peers (Top Section)
    const { data: suggestions } = useQuery({
        queryKey: ['suggested-peers', activeCollege?.id],
        queryFn: async () => {
            const res = await api.get('/social/suggestions');
            return res.data;
        },
        enabled: !!activeCollege
    });

    // 2. Alumni Infinite Scroll
    const {
        data: alumniData,
        fetchNextPage: fetchNextAlumni,
        hasNextPage: hasNextAlumni,
        isFetchingNextPage: isFetchingMoreAlumni,
        status: alumniStatus
    } = useInfiniteQuery({
        queryKey: ['discover-alumni', activeCollege?.id, debouncedSearch, roleFilter],
        queryFn: async ({ pageParam }) => {
            const res = await api.get('/social/alumni', {
                params: { cursor: pageParam, limit: 12, search: debouncedSearch, targetRole: roleFilter }
            });
            return res.data;
        },
        getNextPageParam: (lastPage: any[]) => (lastPage.length > 0) ? lastPage[lastPage.length - 1].id : undefined,
        enabled: tab === 'people' && !!activeCollege
    });

    // 3. All Students Infinite Scroll
    const {
        data: studentData,
        fetchNextPage: fetchNextStudents,
        hasNextPage: hasNextStudents,
        isFetchingNextPage: isFetchingMoreStudents,
        status: studentStatus
    } = useInfiniteQuery({
        queryKey: ['discover-students', activeCollege?.id, debouncedSearch, roleFilter, batchFilter],
        queryFn: async ({ pageParam }) => {
            const res = await api.get('/social/discover', {
                params: { 
                    cursor: pageParam, 
                    limit: 12, 
                    search: debouncedSearch,
                    targetRole: roleFilter,
                    batch: batchFilter
                }
            });
            return res.data;
        },
        getNextPageParam: (lastPage: any[]) => (lastPage.length > 0) ? lastPage[lastPage.length - 1].id : undefined,
        enabled: tab === 'people' && !!activeCollege
    });

    // 4. Hubs List
    const { data: hubs, refetch: refetchHubs } = useQuery({
        queryKey: ['hubs', activeCollege?.id],
        queryFn: async () => {
            const res = await api.get('/environments');
            return res.data;
        },
        enabled: tab === 'hubs' && !!activeCollege
    });
    
    // 5. Colleges List
    const { data: colleges } = useQuery({
        queryKey: ['colleges'],
        queryFn: async () => {
            const res = await api.get('/colleges');
            return res.data.data;
        },
        enabled: tab === 'colleges'
    });

    const handleConnect = async (userId: string) => {
        try {
            await api.post('/social/connect', { receiverId: userId });
            queryClient.invalidateQueries({ queryKey: ['discover-people'] });
            queryClient.invalidateQueries({ queryKey: ['discover-students'] });
        } catch (err) {
            console.error('Failed to connect:', err);
        }
    };

    const handleJoinHub = async (hub: any) => {
        if (hub.privacyLevel === 'SOCIETY') {
            setSelectedHub(hub);
            setShowJoinModal(true);
            return;
        }

        try {
            await api.post(`/environments/join/${hub.id}`);
            refetchHubs();
        } catch (err) {
            console.error('Failed to join hub:', err);
        }
    };

    const renderUserCard = (user: any) => (
        <motion.div 
            key={user.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col items-center text-center group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
        >
            <div className="relative mb-4 md:mb-5">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl bg-slate-100 dark:bg-slate-800 p-0.5 transition-transform duration-300">
                    <div className="w-full h-full rounded-lg md:rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400 overflow-hidden shadow-inner uppercase">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user.name.charAt(0)
                        )}
                    </div>
                </div>
                
                {user.pulse && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-sm shadow-xl border border-slate-100 dark:border-white/10 z-10"
                    >
                        {user.pulseEmoji || '⚡'}
                    </motion.div>
                )}

                {user.is_verified && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 z-10">
                        <Check size={12} strokeWidth={4} />
                    </div>
                )}
            </div>
            
            <div className="mb-4 w-full text-left">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white truncate tracking-tight">{user.name}</h3>
                </div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 truncate">{user.targetRole || 'Building Future'}</p>
                <div className="flex flex-wrap items-center gap-1 md:gap-1.5">
                    <span className="px-2 md:px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        {user.colleges?.[0]?.role?.toLowerCase() === 'alumni' ? 'Alumni' : (user.colleges?.[0]?.role || 'Student')}
                    </span>
                    <span className="px-2 md:px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                        '{(user.colleges?.[0]?.batch || 24).toString().slice(-2)}
                    </span>
                </div>
            </div>

            {/* Stats / Reputation */}
            <div className="flex items-center gap-4 mb-6 w-full px-1">
                <div className="flex-1 text-center">
                    <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none mb-1">{user.reputationScore || 0}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Reputation</p>
                </div>
                <div className="w-px h-6 bg-slate-100 dark:bg-white/5" />
                <div className="flex-1 text-center">
                    <p className="text-[10px] font-black text-blue-500 leading-none mb-1">{user.completionRatio}%</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Portfolio</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full mt-auto relative z-10">
                <button 
                   onClick={() => handleConnect(user.id)}
                   className="flex items-center justify-center gap-1.5 py-2.5 md:py-3 bg-blue-600 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-xl md:rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <UserPlus size={12} className="md:w-3.5 md:h-3.5" />
                    Connect
                </button>
                <Link 
                    to={`/profile/${user.id}`}
                    className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 md:py-3 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-xl md:rounded-2xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all active:scale-95"
                >
                    <ChevronRight size={12} className="md:w-3.5 md:h-3.5" />
                    View
                </Link>
            </div>
        </motion.div>
    );

    return (
        <div className="pb-24 pt-6 px-4 md:px-0 max-w-6xl mx-auto">
            {/* Header & Search */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-8 mb-8 md:mb-10 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1 md:mb-2">Discover</h1>
                        <p className="text-slate-500 text-[11px] md:text-sm font-medium">Expand your network across {activeCollege?.name || 'your campus'}</p>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850 overflow-x-auto no-scrollbar">
                        {['people', 'hubs', 'colleges'].map((t) => (
                            <button 
                                key={t}
                                onClick={() => setTab(t as any)}
                                className={`px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${tab === t ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-[2]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search by name...`}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-14 pr-6 text-sm md:text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                        />
                    </div>
                    {tab === 'people' && (
                        <>
                            <div className="relative flex-1">
                                <Rocket className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input 
                                    type="text"
                                    placeholder="By Target Role (e.g. SDE)"
                                    value={targetRoleQuery}
                                    onChange={(e) => setTargetRoleQuery(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-11 pr-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <div className="relative w-24 md:w-32">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                <input 
                                    type="number"
                                    placeholder="Batch"
                                    value={batchFilter}
                                    onChange={(e) => setBatchFilter(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-10 pr-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-16">
                {tab === 'people' && (
                    <>
                        {/* 1. Recommended Peers */}
                        {suggestions?.length > 0 && !debouncedSearch && (
                            <section>
                                <div className="flex items-center gap-3 mb-8 px-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recommended for You</h2>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Based on your department & batch</p>
                                    </div>
                                </div>
                                <div className="flex gap-5 overflow-x-auto pb-6 px-1 no-scrollbar scroll-smooth">
                                    {Array.isArray(suggestions) && suggestions.map((user: any) => (
                                        <div key={user.id} className="w-64 shrink-0">
                                            {renderUserCard(user)}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 2. Alumni */}
                        <section>
                            <div className="flex items-center justify-between mb-8 px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <GraduationCap size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Distinguished Alumni</h2>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Learn from those who paved the way</p>
                                    </div>
                                </div>
                            </div>
                            
                            {alumniStatus === 'loading' ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-100 dark:bg-slate-900/40 rounded-2xl animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {Array.isArray(alumniData?.pages) && alumniData.pages.map((page: any) => 
                                        Array.isArray(page) && page.map((user: any) => renderUserCard(user))
                                    )}
                                </div>
                            )}
                            
                            {hasNextAlumni && (
                                <div className="mt-10 text-center">
                                    <button 
                                        onClick={() => fetchNextAlumni()}
                                        disabled={isFetchingMoreAlumni}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        {isFetchingMoreAlumni ? <Loader2 className="animate-spin" size={16} /> : 'Load More Alumni'}
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* 3. All Students */}
                        <section>
                            <div className="flex items-center gap-3 mb-8 px-2">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Explore Peers</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Find your next collaborator</p>
                                </div>
                            </div>

                            {studentStatus === 'loading' ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-100 dark:bg-slate-900/40 rounded-2xl animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {Array.isArray(studentData?.pages) && studentData.pages.map((page: any) => 
                                        Array.isArray(page) && page.map((user: any) => renderUserCard(user))
                                    )}
                                </div>
                            )}

                            {hasNextStudents && (
                                <div className="mt-10 text-center">
                                    <button 
                                        onClick={() => fetchNextStudents()}
                                        disabled={isFetchingMoreStudents}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        {isFetchingMoreStudents ? <Loader2 className="animate-spin" size={16} /> : 'Load More Students'}
                                    </button>
                                </div>
                            )}
                        </section>
                    </>
                )}

                {tab === 'colleges' && (
                    <section>
                        <div className="flex items-center gap-3 mb-8 px-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Partner Institutions</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Explore other campuses in the network</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.isArray(colleges) && colleges.map((college: any) => (
                                <motion.div 
                                    key={college.id} 
                                    whileHover={{ y: -5 }}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col shadow-sm group"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: college.primaryColor + '10', color: college.primaryColor }}>
                                            <Building2 size={32} />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. {new Date(college.createdAt).getFullYear()}</span>
                                            <div className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase tracking-widest rounded-lg border border-indigo-500/20">Verified</div>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{college.name}</h3>
                                    <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6">
                                        {college.description || `The official Allumnova portal for ${college.name} students and alumni.`}
                                    </p>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5 mt-auto">
                                            <div className="flex items-center gap-2">
                                                <Globe size={16} className="text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{college.domain || `${college.subdomain}.allumnova.com`}</span>
                                            </div>
                                            {(() => {
                                                const membership = currentUser?.colleges?.find((m: any) => m.collegeId === college.id || m.id === college.id);
                                                const status = membership?.status;

                                                if (status === 'APPROVED') {
                                                    return (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setActiveCollege(college);
                                                                navigate('/');
                                                            }}
                                                            className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95"
                                                        >
                                                            Switch
                                                        </button>
                                                    );
                                                } else if (status === 'PENDING') {
                                                    return (
                                                        <div className="px-5 py-2.5 bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-amber-500/20">
                                                            Pending
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <Link 
                                                            to={`/onboarding?collegeId=${college.id}`}
                                                            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95"
                                                        >
                                                            Join Campus
                                                        </Link>
                                                    );
                                                }
                                            })()}
                                        </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {tab === 'hubs' && (
                    <section>
                        <div className="flex items-center justify-between mb-8 px-2">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Rocket size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Campus Hubs</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Communities that shape your experience</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsProposeModalOpen(true)}
                                className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 shadow hover:scale-105 active:scale-95 transition-all"
                            >
                                <Plus size={16} />
                                Propose Hub
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.isArray(hubs) && hubs.map((hub: any) => (
                                <div key={hub.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col shadow-sm">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner">
                                            {hub.icon || '🏢'}
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <div className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20">
                                                {hub.type}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                                {hub.privacyLevel === 'PUBLIC' ? <Globe size={10} /> : hub.privacyLevel === 'SOCIETY' ? <Shield size={10} /> : <Lock size={10} />}
                                                {hub.privacyLevel === 'PUBLIC' ? 'Public' : hub.privacyLevel === 'SOCIETY' ? 'Vetted' : 'Private'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{hub.name}</h3>
                                    <p className="text-slate-500 text-sm font-medium line-clamp-3 mb-6 flex-1">
                                        {hub.description || 'No description provided.'}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-slate-400" />
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{hub.memberCount} Members</span>
                                        </div>
                                        
                                        {hub.userStatus === 'APPROVED' ? (
                                            <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                                <Check size={14} /> Member
                                            </div>
                                        ) : hub.userStatus === 'PENDING' ? (
                                            <div className="flex items-center gap-1.5 text-blue-500 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 px-4 py-2 rounded-xl">
                                                <Info size={14} /> Requested
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleJoinHub(hub)}
                                                className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow shadow-blue-600/10"
                                            >
                                                {hub.privacyLevel === 'SOCIETY' ? 'Apply to Join' : 'Join Hub'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>



            <ProposeHubModal 
                isOpen={isProposeModalOpen}
                onClose={() => setIsProposeModalOpen(false)}
                onSuccess={() => {
                    setIsProposeModalOpen(false);
                    refetchHubs();
                }}
            />

            {selectedHub && (
                <JoinRequestModal 
                    isOpen={showJoinModal}
                    onClose={() => setShowJoinModal(false)}
                    hubId={selectedHub.id}
                    hubName={selectedHub.name}
                    questions={selectedHub.joinQuestions || []}
                    onSuccess={() => {
                        setShowJoinModal(false);
                        refetchHubs();
                    }}
                />
            )}
        </div>
    );
};

export default DiscoverPage;
