import React, { useState, useEffect } from 'react';
import { useCollege } from '../contexts/CollegeContext';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, Plus, Users, Image as ImageIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import MentorshipRequestModal from '../components/profile/MentorshipRequestModal';
import { useAuth } from '../contexts/AuthContext';

const DiscoverPage = () => {
    const { activeCollege, refreshColleges } = useCollege();
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);

    const [tab, setTab] = useState<'people' | 'colleges' | 'hubs'>(
        searchParams.get('tab') === 'colleges' ? 'colleges' : 
        searchParams.get('tab') === 'hubs' ? 'hubs' : 'people'
    );
    const [isSuggesting, setIsSuggesting] = useState(searchParams.get('suggest') === 'true');
    const [colleges, setColleges] = useState<any[]>([]);
    const [hubs, setHubs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [batchFilter, setBatchFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [showMentorshipModal, setShowMentorshipModal] = useState(false);
    const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
    const [selectedMentorName, setSelectedMentorName] = useState<string>('');
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Form state for suggestions
    const [suggestName, setSuggestName] = useState('');
    const [suggestSubdomain, setSuggestSubdomain] = useState('');
    const [suggestWebsite, setSuggestWebsite] = useState('');
    const [suggestLogo, setSuggestLogo] = useState('');
    const [suggestLocation, setSuggestLocation] = useState('');
    const [suggestDescription, setSuggestDescription] = useState('');
    const [myRequests, setMyRequests] = useState<any[]>([]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('tab') === 'colleges') setTab('colleges');
        if (queryParams.get('suggest') === 'true') {
            setTab('colleges');
            setIsSuggesting(true);
        }
    }, [location.search]);

    const {
        data: userData,
        fetchNextPage: fetchNextUsers,
        hasNextPage: hasNextUsers,
        isFetchingNextPage: isFetchingMoreUsers,
        status: userStatus
    } = useInfiniteQuery({
        queryKey: ['discover-people', activeCollege?.id, debouncedSearch, roleFilter, batchFilter],
        queryFn: async ({ pageParam }) => {
            const res = await api.get('/social/discover', {
                params: { 
                    cursor: pageParam, 
                    limit: 12,
                    ...(debouncedSearch && { search: debouncedSearch }),
                    ...(roleFilter && { role: roleFilter }),
                    ...(batchFilter && { batchYear: batchFilter })
                }
            });
            return res.data;
        },
        getNextPageParam: (lastPage) => (lastPage.length > 0) ? lastPage[lastPage.length - 1].id : undefined,
        enabled: tab === 'people' && !!activeCollege
    });

    const { data: suggestions } = useQuery({
        queryKey: ['suggested-peers', activeCollege?.id],
        queryFn: async () => {
            const res = await api.get('/social/suggestions');
            return res.data;
        },
        enabled: tab === 'people' && !!activeCollege
    });

    useEffect(() => {
        const fetchData = async () => {
            if (tab === 'people') return; // Handled by react-query
            setLoading(true);
            try {
                if (tab === 'colleges') {
                    const res = await api.get('/colleges');
                    setColleges(res.data.data || res.data);
                } else if (tab === 'hubs') {
                    const res = await api.get('/environments');
                    setHubs(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeCollege, tab]);

    useEffect(() => {
        const fetchMyRequests = async () => {
            try {
                const res = await api.get('/colleges/my-requests');
                setMyRequests(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        if (tab === 'colleges') fetchMyRequests();
    }, [tab]);

    const handleConnect = async (userId: string) => {
        try {
            await api.post('/social/connect', { receiverId: userId });
            
            // Invalidate the discover and suggestions queries to refresh the list
            queryClient.invalidateQueries({ queryKey: ['discover-people', activeCollege?.id] });
            queryClient.invalidateQueries({ queryKey: ['suggested-peers', activeCollege?.id] });
            
            alert('Connection request sent!');
        } catch (err: any) {
            console.error(err);
            const message = err.response?.data?.message || 'Failed to send connection request.';
            alert(message);
        }
    };

    const handleJoinCollege = async (collegeId: string) => {
        try {
            await api.post('/colleges/join', { collegeId, role: 'student' });
            alert('Join request sent! After approval, you can switch to this college.');
            await refreshColleges();
        } catch (err: any) {
            const message = err.response?.data?.error || 'Failed to send join request.';
            alert(message);
        }
    };

    const handleSuggestCollege = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/colleges/suggest', {
                name: suggestName,
                subdomain: suggestSubdomain,
                website: suggestWebsite,
                logo: suggestLogo,
                location: suggestLocation,
                description: suggestDescription
            });
            alert('Thank you! Your college suggestion has been recorded.');
            setIsSuggesting(false);
            const res = await api.get('/colleges/my-requests');
            setMyRequests(res.data.data);
        } catch (err) {
            alert('Failed to send suggestion.');
        }
    };

    return (
        <div className="pb-24 pt-4">
            <div className="bg-white/70 dark:bg-slate-900/30 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 mb-8 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Discover</h1>
                <div className="flex justify-center sm:justify-start gap-4 mb-6">
                    <button onClick={() => setTab('people')} className={`text-sm font-bold pb-2 border-b-2 transition-all ${tab === 'people' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400'}`}>People</button>
                    <button onClick={() => setTab('hubs')} className={`text-sm font-bold pb-2 border-b-2 transition-all ${tab === 'hubs' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400'}`}>Hubs</button>
                    <button onClick={() => { setTab('colleges'); setIsSuggesting(false); }} className={`text-sm font-bold pb-2 border-b-2 transition-all ${tab === 'colleges' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400'}`}>Colleges</button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 max-w-3xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={
                                tab === 'people' ? "Search for peers..." : 
                                tab === 'hubs' ? "Search for hubs..." : "Search for colleges..."
                            }
                            className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-2xl py-4 pl-14 pr-6 text-slate-900 dark:text-white outline-none"
                        />
                    </div>
                    {tab === 'people' && (
                        <div className="flex gap-3">
                            <select 
                                value={roleFilter} 
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-4 text-sm text-slate-900 dark:text-white outline-none"
                            >
                                <option value="">All Roles</option>
                                <option value="STUDENT">Student</option>
                                <option value="ALUMNI">Alumni</option>
                            </select>
                            <input 
                                type="text"
                                placeholder="Batch (e.g. 2024)"
                                value={batchFilter}
                                onChange={(e) => setBatchFilter(e.target.value)}
                                className="w-32 bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-4 text-sm text-slate-900 dark:text-white outline-none"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-8">
                {tab === 'people' && suggestions?.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">You might know</h2>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {suggestions.map((user: any) => (
                                <motion.div 
                                    key={user.id} 
                                    whileHover={{ y: -5 }}
                                    className="flex-shrink-0 w-48 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-3xl p-5 flex flex-col items-center text-center"
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-3 flex items-center justify-center text-lg font-bold overflow-hidden ring-2 ring-blue-500/20">
                                        {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                    </div>
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1 truncate w-full">{user.name}</h3>
                                    <p className="text-[9px] text-slate-500 mb-4">{user.colleges?.[0]?.batch ? `Batch ${user.colleges[0].batch}` : 'Peer'}</p>
                                    <button 
                                        onClick={() => handleConnect(user.id)}
                                        className="w-full py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white text-[9px] font-bold rounded-xl transition-all"
                                    >
                                        Connect
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="bg-white dark:bg-slate-900/30 h-48 rounded-[2rem] animate-pulse border border-slate-200 dark:border-white/5" />)}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                            <AnimatePresence mode="wait">
                                {tab === 'people' ? (
                                    userStatus === 'loading' ? (
                                        [1, 2, 3, 4].map(i => <div key={i} className="bg-white dark:bg-slate-900/30 h-48 rounded-[2rem] animate-pulse border border-slate-200 dark:border-white/5" />)
                                    ) : (
                                        userData?.pages.map(page => page.map((user: any) => (
                                            <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-5 flex flex-col items-center text-center">
                                                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-3 flex items-center justify-center text-xl font-bold overflow-hidden">
                                                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{user.name}</h3>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <p className="text-[10px] text-slate-500 capitalize">{user.role || 'Student'}</p>
                                                    <div className={clsx(
                                                        "flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider",
                                                        getTierStyle(user.tierLevel || 'Echo')
                                                    )}>
                                                        {user.reputationScore}
                                                    </div>
                                                </div>
                                                
                                                {(user.role === 'alumni' || user.role === 'ALUMNI') && (
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedMentorId(user.id);
                                                            setSelectedMentorName(user.name);
                                                            setShowMentorshipModal(true);
                                                        }}
                                                        className="mt-4 w-full py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white dark:text-blue-400 font-bold rounded-xl text-xs transition-all border border-blue-500/20"
                                                    >
                                                        Request Mentorship
                                                    </button>
                                                )}
                                                <button onClick={() => handleConnect(user.id)} className="mt-2 w-full bg-blue-600 text-white text-[10px] font-bold py-2 rounded-xl transition-all hover:bg-blue-500">Connect</button>
                                            </motion.div>
                                        )))
                                    )
                                ) : tab === 'hubs' ? (
                                    <>
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }} 
                                            animate={{ opacity: 1, scale: 1 }} 
                                            onClick={() => setIsSuggesting(true)}
                                            className="group bg-blue-500/5 border-2 border-dashed border-blue-500/20 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-500/10 transition-all"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 mb-4">
                                                <Plus size={24} />
                                            </div>
                                            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">Propose New Hub</h3>
                                            <p className="text-[10px] text-slate-500">Start a community around your interests.</p>
                                        </motion.div>
                                        
                                        {hubs.map((hub) => (
                                            <motion.div key={hub.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-500/10">
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <div className="w-12 h-12 bg-blue-500 rounded-full blur-2xl" />
                                                </div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">{hub.type}</span>
                                                    <span className="flex items-center gap-1 text-[10px] text-slate-400"><Users size={12} /> {hub._count?.members || 0} members</span>
                                                </div>
                                                <h3 
                                                    className="text-[15px] font-bold text-slate-900 dark:text-white mb-2 leading-tight hover:text-blue-500 cursor-pointer transition-colors"
                                                    onClick={() => navigate(`/hubs/${hub.id}`)}
                                                >
                                                    {hub.name}
                                                </h3>
                                                <p className="text-[11px] text-slate-500 line-clamp-2 mb-6 h-8">{hub.description || 'No description provided.'}</p>
                                                
                                                <div className="flex -space-x-2 mb-6">
                                                    {hub.members?.map((m: any, i: number) => (
                                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                            {m.user?.avatar ? <img src={m.user.avatar} alt="member" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] font-bold">{m.user?.name?.charAt(0)}</div>}
                                                        </div>
                                                    ))}
                                                    {hub._count?.members > 5 && (
                                                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                            +{hub._count.members - 5}
                                                        </div>
                                                    )}
                                                </div>

                                                <button 
                                                    onClick={async () => {
                                                        try {
                                                            await api.post('/environments/join', { environmentId: hub.id });
                                                            alert(`Successfully joined ${hub.name}!`);
                                                            setHubs(prev => prev.map(h => h.id === hub.id ? { ...h, _count: { ...h._count, members: (h._count?.members || 0) + 1 } } : h));
                                                        } catch (err) {
                                                            alert('Failed to join hub');
                                                        }
                                                    }}
                                                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold py-3 rounded-xl transition-all hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500"
                                                >
                                                    Join Hub
                                                </button>
                                            </motion.div>
                                        ))}
                                    </>
                                ) : (
                                    colleges.map((col) => (
                                        <motion.div key={col.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-blue-500"><Building2 size={24} /></div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{col.name}</h3>
                                                <p className="text-[10px] text-slate-500 mb-3">{col.subdomain}.allumnova.com</p>
                                                <button onClick={() => handleJoinCollege(col.id)} className="bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white text-slate-900 dark:text-white text-[10px] font-bold py-1.5 px-4 rounded-lg transition-all flex items-center gap-1"><Plus size={12} /> Join</button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {tab === 'people' && hasNextUsers && (
                            <div className="flex justify-center mb-8">
                                <button
                                    onClick={() => fetchNextUsers()}
                                    disabled={isFetchingMoreUsers}
                                    className="px-8 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl text-xs font-bold text-slate-500 hover:text-blue-500 transition-all flex items-center gap-3"
                                >
                                    {isFetchingMoreUsers ? (
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    ) : 'Load More People'}
                                </button>
                            </div>
                        )}

                        {tab === 'colleges' && myRequests.length > 0 && (
                            <div className="mb-12 px-2">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">My Requests</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {myRequests.map((req) => (
                                        <div key={req.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between">
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{req.name}</h4>
                                                <p className="text-[10px] text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${req.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : req.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tab === 'colleges' && !isSuggesting && (
                            <div className="text-center py-8">
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Don't see your college?</p>
                                <button onClick={() => setIsSuggesting(true)} className="text-blue-500 font-bold text-sm hover:underline">Suggest a new college</button>
                            </div>
                        )}

                        {isSuggesting && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 max-w-2xl mx-auto shadow-2xl">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    {tab === 'hubs' ? 'Propose New Hub' : 'Suggest College'}
                                </h3>
                                <p className="text-xs text-slate-500 mb-6">
                                    {tab === 'hubs' ? 'Start a new community space for your college.' : 'Provide details for admin approval.'}
                                </p>
                                <form onSubmit={tab === 'hubs' ? async (e) => {
                                    e.preventDefault();
                                    try {
                                        await api.post('/environments', { name: suggestName, description: suggestDescription });
                                        alert('Hub proposal submitted! Once approved, it will appear in Discovery.');
                                        setIsSuggesting(false);
                                        setSuggestName('');
                                        setSuggestDescription('');
                                    } catch (err) {
                                        alert('Failed to send proposal.');
                                    }
                                } : handleSuggestCollege} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">{tab === 'hubs' ? 'Hub' : 'College'} Name*</label>
                                        <input required type="text" value={suggestName} onChange={(e) => setSuggestName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm dark:text-white outline-none" placeholder={tab === 'hubs' ? "e.g. AI Researchers" : "e.g. Harvard University"} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Description</label>
                                        <textarea value={suggestDescription} onChange={(e) => setSuggestDescription(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm dark:text-white outline-none h-24 resize-none" placeholder={tab === 'hubs' ? "What is this hub about?" : "Brief description..."} />
                                    </div>
                                    {tab === 'colleges' && (
                                        <div className="sm:col-span-2">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">College Website</label>
                                            <input type="url" value={suggestWebsite} onChange={(e) => setSuggestWebsite(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm dark:text-white outline-none" placeholder="https://..." />
                                        </div>
                                    )}
                                    <div className="sm:col-span-2 flex gap-3 pt-4">
                                        <button type="submit" disabled={!suggestName} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 text-sm">Submit</button>
                                        <button type="button" onClick={() => setIsSuggesting(false)} className="px-8 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm">Cancel</button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            <MentorshipRequestModal 
                isOpen={showMentorshipModal}
                onClose={() => setShowMentorshipModal(false)}
                alumniId={selectedMentorId || ''}
                alumniName={selectedMentorName || ''}
            />
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

export default DiscoverPage;
