import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCollege } from '../contexts/CollegeContext';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, UserPlus, Clock, Check, X, Search as SearchIcon, Sparkles } from 'lucide-react';

const ConnectionsPage = () => {
    const { user } = useAuth();
    const { activeCollege } = useCollege();
    const [tab, setTab] = useState<'requests' | 'my' | 'discover'>('requests');
    const [pending, setPending] = useState<{ incoming: any[], outgoing: any[] }>({ incoming: [], outgoing: [] });
    const [connections, setConnections] = useState<any[]>([]);
    const [discoverUsers, setDiscoverUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, [tab, activeCollege]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (tab === 'requests') {
                const res = await api.get('/social/connect/pending');
                setPending(res.data);
            } else if (tab === 'my') {
                const res = await api.get('/social/connections');
                setConnections(res.data);
            } else if (tab === 'discover') {
                const res = await api.get('/social/discover');
                setDiscoverUsers(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId: string) => {
        try {
            await api.post('/social/connect/accept', { requestId });
            setPending(prev => ({
                ...prev,
                incoming: (Array.isArray(prev?.incoming) ? prev.incoming : []).filter(r => r && r.id !== requestId)
            }));
            // Optionally refresh connections if we were on that tab, but we're in requests
        } catch (err) {
            console.error(err);
        }
    };

    const handleDecline = async (requestId: string) => {
        try {
            await api.post('/social/connect/decline', { requestId });
            setPending(prev => ({
                ...prev,
                incoming: (Array.isArray(prev?.incoming) ? prev.incoming : []).filter(r => r && r.id !== requestId),
                outgoing: (Array.isArray(prev?.outgoing) ? prev.outgoing : []).filter(r => r && r.id !== requestId)
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleConnect = async (userId: string) => {
        try {
            await api.post('/social/connect', { receiverId: userId });
            setDiscoverUsers(prev => (Array.isArray(prev) ? prev : []).filter(u => u && u.id !== userId));
            // Trigger refresh of pending outgoing
        } catch (err) {
            console.error(err);
        }
    };

    const navigate = useNavigate();

    const handleRemoveConnection = async (targetId: string) => {
        if (!window.confirm('Are you sure you want to remove this connection?')) return;
        try {
            await api.delete(`/social/connections/${targetId}`);
            setConnections(prev => (Array.isArray(prev) ? prev : []).filter(c => c && c.userId !== targetId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="pb-24 pt-4">
            <div className="mb-8 p-6 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Network</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Manage your connections and discover new peers</p>
                
                <div className="flex gap-4 border-b border-slate-100 dark:border-white/5">
                    {[
                        { id: 'requests', label: 'Requests', icon: Clock },
                        { id: 'my', label: 'My Connections', icon: Users },
                        { id: 'discover', label: 'Discover', icon: Sparkles }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id as any)}
                            className={`flex items-center gap-2 px-1 pb-3 text-sm font-bold transition-all relative ${tab === t.id ? 'text-blue-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        >
                            <t.icon size={16} />
                            {t.label}
                            {tab === t.id && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                            )}
                            {t.id === 'requests' && pending.incoming.length > 0 && (
                                <span className="ml-1 w-4 h-4 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">
                                    {pending.incoming.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {tab === 'requests' && (
                    <motion.div key="requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        {/* Incoming Requests */}
                        <div>
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 ml-4">Incoming Requests</h2>
                            {pending.incoming.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {pending.incoming.map((req) => (
                                        <div key={req.id} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-5 flex items-center gap-4 group transition-all hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                                            <Link to={req.user ? `/profile/${req.user.id}` : '#'} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 p-[2px] shadow-lg shadow-blue-500/10 hover:scale-105 transition-transform">
                                                <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                                    {req.user?.avatar ? <img src={req.user.avatar} className="w-full h-full object-cover" alt="" /> : <span className="text-lg font-bold">{req.user?.name?.charAt(0) || '?'}</span>}
                                                </div>
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <Link to={req.user ? `/profile/${req.user.id}` : '#'} className="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-blue-500 transition-colors block">{req.user?.name || 'Unknown User'}</Link>
                                                <p className="text-[10px] text-slate-500 truncate">{req.user?.department || 'Department'} • {req.user?.batch_year || 'Batch'}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAccept(req.id)} className="w-9 h-9 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                                                    <Check size={18} />
                                                </button>
                                                <button onClick={() => handleDecline(req.id)} className="w-9 h-9 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] p-8 text-center">
                                    <p className="text-sm text-slate-400">No incoming requests</p>
                                </div>
                            )}
                        </div>

                        {/* Outgoing Requests */}
                        <div>
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 ml-4">Sent Requests</h2>
                            {pending.outgoing.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {pending.outgoing.map((req) => (
                                        <div key={req.id} className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-[2rem] p-5 flex items-center gap-4 opacity-80">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                                {req.user.avatar ? <img src={req.user.avatar} className="w-full h-full object-cover" alt="" /> : <span className="text-sm font-bold text-slate-400">{req.user.name.charAt(0)}</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{req.user?.name || 'Unknown'}</h3>
                                                <p className="text-[10px] text-slate-400">Sent on {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                            <button onClick={() => handleDecline(req.id)} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg">Cancel</button>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </motion.div>
                )}

                {tab === 'my' && (
                    <motion.div key="my" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                        {connections.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {connections.map((conn) => (
                                    <div key={conn.id} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 text-center group transition-all hover:bg-blue-500/[0.02] hover:border-blue-500/20 shadow-sm">
                                        <Link to={`/profile/${conn.userId}`} className="w-20 h-20 mx-auto rounded-[2rem] bg-gradient-to-tr from-blue-500 to-emerald-500 p-[3px] mb-4 shadow-xl shadow-blue-500/10 hover:scale-105 transition-transform block">
                                            <div className="w-full h-full rounded-[1.8rem] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                                {conn.avatar ? <img src={conn.avatar} className="w-full h-full object-cover" alt="" /> : <span className="text-2xl font-bold">{conn.name.charAt(0)}</span>}
                                            </div>
                                        </Link>
                                        <Link to={conn.userId ? `/profile/${conn.userId}` : '#'} className="text-base font-bold text-slate-900 dark:text-white mb-1 hover:text-blue-500 transition-colors block">{conn.name || 'User'}</Link>
                                        <p className="text-xs text-slate-500 mb-6">{conn.role || 'Student'}</p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => navigate(`/chat?userId=${conn.userId}`)}
                                                className="flex-1 bg-blue-600 text-white text-xs font-bold py-2.5 rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                Message
                                            </button>
                                            <button 
                                                onClick={() => handleRemoveConnection(conn.userId)}
                                                className="px-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-[3rem] p-16 text-center">
                                <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Build your circle</h3>
                                <p className="text-sm text-slate-500 mb-8">You haven't connected with anyone yet.</p>
                                <button onClick={() => setTab('discover')} className="bg-blue-600 text-white text-sm font-bold px-8 py-3 rounded-2xl shadow-lg shadow-blue-500/20">Explore People</button>
                            </div>
                        )}
                    </motion.div>
                )}

                {tab === 'discover' && (
                    <motion.div key="discover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="relative">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search for peers in your college..."
                                className="w-full bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/30 shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {discoverUsers.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {discoverUsers.map((u) => (
                                    <div key={u.id} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-5 flex items-center gap-4 group transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                                        <Link to={`/profile/${u.id}`} className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-50 dark:border-slate-800 shadow-inner hover:scale-105 transition-transform">
                                            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : <span className="text-lg font-bold text-slate-400">{u.name.charAt(0)}</span>}
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link to={u.id ? `/profile/${u.id}` : '#'} className="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-blue-500 transition-colors block">{u.name || 'User'}</Link>
                                            <p className="text-[10px] text-slate-500 truncate">{u.colleges?.[0]?.batch || 'Batch'} • {u.colleges?.[0]?.role || 'Role'}</p>
                                        </div>
                                        <button onClick={() => handleConnect(u.id)} className="px-4 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-1.5">
                                            <UserPlus size={14} />
                                            Connect
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <Search size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                <p className="text-sm text-slate-500">No new connections found at the moment.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ConnectionsPage;
