import React, { useState, useEffect } from 'react';
import { useCollege } from '../contexts/CollegeContext';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, Plus, Users, Sparkles, GraduationCap, UserPlus, Check, X, Filter, Rocket, Info, ChevronRight, Loader2 } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import MentorshipRequestModal from '../components/profile/MentorshipRequestModal';
import { useAuth } from '../contexts/AuthContext';

const DiscoverPage = () => {
    const { activeCollege } = useCollege();
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
    const [batchFilter, setBatchFilter] = useState('');
    
    const [showMentorshipModal, setShowMentorshipModal] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

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
        queryKey: ['discover-alumni', activeCollege?.id, debouncedSearch],
        queryFn: async ({ pageParam }) => {
            const res = await api.get('/social/alumni', {
                params: { cursor: pageParam, limit: 12, search: debouncedSearch }
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
                    role: roleFilter,
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

    const handleConnect = async (userId: string) => {
        try {
            await api.post('/social/connect', { receiverId: userId });
            queryClient.invalidateQueries({ queryKey: ['discover-people'] });
            queryClient.invalidateQueries({ queryKey: ['discover-students'] });
        } catch (err) {
            console.error('Failed to connect:', err);
        }
    };

    const handleJoinHub = async (hubId: string) => {
        try {
            await api.post(`/environments/${hubId}/join`);
            refetchHubs();
        } catch (err) {
            console.error('Failed to join hub:', err);
        }
    };

    const renderUserCard = (user: any) => (
        <motion.div 
            key={user.id} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-5 flex flex-col items-center text-center group"
        >
            <div className="relative mb-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-blue-500/20 transition-all">
                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                </div>
                {user.pulse && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center text-xs shadow-lg border border-slate-100 dark:border-white/5">
                        {user.pulseEmoji || '⚡'}
                    </div>
                )}
            </div>
            
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5 truncate w-full">{user.name}</h3>
            <div className="flex items-center gap-1.5 mb-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.colleges?.[0]?.role || 'Student'}</p>
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <p className="text-[10px] text-slate-500 font-bold">Batch {user.colleges?.[0]?.batch || '24'}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
                <button 
                   onClick={() => handleConnect(user.id)}
                   className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all"
                >
                    <UserPlus size={12} />
                    Connect
                </button>
                {user.colleges?.[0]?.role === 'ALUMNI' ? (
                    <button 
                        onClick={() => { setSelectedMentor({ id: user.id, name: user.name }); setShowMentorshipModal(true); }}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                    >
                        <GraduationCap size={12} />
                        Mentor
                    </button>
                ) : (
                    <Link 
                        to={`/profile/${user.username || user.id}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                    >
                        <ChevronRight size={12} />
                        Profile
                    </Link>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="pb-24 pt-6 px-4 md:px-0 max-w-6xl mx-auto">
            {/* Header & Search */}
            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-[3rem] p-8 mb-10 shadow-2xl shadow-blue-500/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Discover</h1>
                        <p className="text-slate-500 text-sm font-medium">Expand your network across {activeCollege?.name || 'your campus'}</p>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-950/50 p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-white/5">
                        {['people', 'hubs', 'colleges'].map((t) => (
                            <button 
                                key={t}
                                onClick={() => setTab(t as any)}
                                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search for ${tab === 'people' ? 'peers & alumni' : tab}...`}
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-[1.5rem] py-5 pl-14 pr-6 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                        />
                    </div>
                    {tab === 'people' && (
                        <div className="flex gap-3">
                             <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <select 
                                    value={roleFilter} 
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="appearance-none bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-[1.5rem] py-5 pl-11 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                >
                                    <option value="">All Roles</option>
                                    <option value="STUDENT">Student</option>
                                    <option value="ALUMNI">Alumni</option>
                                </select>
                            </div>
                            <input 
                                type="number"
                                placeholder="Batch"
                                value={batchFilter}
                                onChange={(e) => setBatchFilter(e.target.value)}
                                className="w-28 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-[1.5rem] py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
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
                                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recommended for You</h2>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Based on your department & batch</p>
                                    </div>
                                </div>
                                <div className="flex gap-5 overflow-x-auto pb-6 px-1 no-scrollbar scroll-smooth">
                                    {suggestions.map((user: any) => (
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
                                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
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
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-100 dark:bg-slate-900/40 rounded-[2rem] animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {alumniData?.pages.map((page: any) => page.map((user: any) => renderUserCard(user)))}
                                </div>
                            )}
                            
                            {hasNextAlumni && (
                                <div className="mt-10 text-center">
                                    <button 
                                        onClick={() => fetchNextAlumni()}
                                        disabled={isFetchingMoreAlumni}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                                    >
                                        {isFetchingMoreAlumni ? <Loader2 className="animate-spin" size={16} /> : 'Load More Alumni'}
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* 3. All Students */}
                        <section>
                            <div className="flex items-center gap-3 mb-8 px-2">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Explore Peers</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Find your next collaborator</p>
                                </div>
                            </div>

                            {studentStatus === 'loading' ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-100 dark:bg-slate-900/40 rounded-[2rem] animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {studentData?.pages.map((page: any) => page.map((user: any) => renderUserCard(user)))}
                                </div>
                            )}

                            {hasNextStudents && (
                                <div className="mt-10 text-center">
                                    <button 
                                        onClick={() => fetchNextStudents()}
                                        disabled={isFetchingMoreStudents}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                                    >
                                        {isFetchingMoreStudents ? <Loader2 className="animate-spin" size={16} /> : 'Load More Students'}
                                    </button>
                                </div>
                            )}
                        </section>
                    </>
                )}

                {tab === 'hubs' && (
                    <section>
                        <div className="flex items-center justify-between mb-8 px-2">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <Rocket size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Campus Hubs</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Communities that shape your experience</p>
                                </div>
                            </div>
                            <Link to="/launchpad" className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 shadow-xl">
                                <Plus size={16} />
                                Propose Hub
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hubs?.map((hub: any) => (
                                <div key={hub.id} className="bg-white dark:bg-slate-900/50 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col shadow-sm">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner">
                                            {hub.icon || '🏢'}
                                        </div>
                                        <div className="px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-500/20">
                                            {hub.type}
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
                                                onClick={() => handleJoinHub(hub.id)}
                                                className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-[1.2rem] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                                            >
                                                Apply to Join
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {selectedMentor && (
                <MentorshipRequestModal 
                    isOpen={showMentorshipModal}
                    onClose={() => setShowMentorshipModal(false)}
                    alumniId={selectedMentor.id}
                    alumniName={selectedMentor.name}
                />
            )}
        </div>
    );
};

export default DiscoverPage;
