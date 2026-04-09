import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCollege } from '../contexts/CollegeContext';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, MessageCircle, Star, Filter, Rocket } from 'lucide-react';

const HubFeedPage = () => {
    const { hubId } = useParams<{ hubId: string }>();
    const { activeCollege } = useCollege();
    const navigate = useNavigate();
    const [hubInfo, setHubInfo] = useState<any>(null);
    const [topShowcases, setTopShowcases] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    // Fetch Hub Details & Leaderboard
    useEffect(() => {
        const fetchHubData = async () => {
            try {
                const [hubRes, leaderboardRes] = await Promise.all([
                    api.get(`/environments/${hubId}`),
                    api.get(`/environments/${hubId}/leaderboard`)
                ]);
                setHubInfo(hubRes.data);
                setLeaderboard(leaderboardRes.data || []);
            } catch (err) {
                console.error('Failed to fetch hub data:', err);
            }
        };
        if (hubId) fetchHubData();
    }, [hubId]);

    // Fetch Top Showcases for this Hub
    useEffect(() => {
        const fetchShowcases = async () => {
            try {
                const res = await api.get('/feed', {
                    params: { hubId, limit: 3, type: 'PROJECT' }
                });
                setTopShowcases(res.data || []);
            } catch (err) {
                console.error('Failed to fetch showcases:', err);
            }
        };
        if (hubId) fetchShowcases();
    }, [hubId]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey: ['feed-hub', hubId],
        queryFn: async ({ pageParam }) => {
            const res = await api.get('/feed', {
                params: {
                    cursor: pageParam,
                    limit: 10,
                    hubId: hubId
                }
            });
            return res.data || [];
        },
        getNextPageParam: (lastPage) => (Array.isArray(lastPage) && lastPage.length > 0) ? lastPage[lastPage.length - 1].id : undefined,
        enabled: !!hubId
    });

    const handleInteraction = async (postId: string, type: 'appreciate' | 'boost') => {
        try {
            await api.post('/feed/interact', { postId, type });
            refetch();
        } catch (err) {
            console.error(`Failed to ${type}:`, err);
        }
    };

    return (
        <div className="pb-24 pt-4 px-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 hover:text-blue-500 transition-all shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{hubInfo?.name || 'Hub Feed'}</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                        <Users size={12} className="text-blue-500" /> {hubInfo?._count?.members || 0} Members • {hubInfo?.type || 'Community'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {/* Top Showcases Carousel */}
                    {topShowcases.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <Star size={14} className="text-amber-500 fill-amber-500" />
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hub Showcases</h2>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                {topShowcases.map((post: any) => (
                                    <motion.div 
                                        key={post.id}
                                        whileHover={{ y: -5 }}
                                        className="w-[300px] shrink-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-6 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
                                        <div className="relative z-10 h-full flex flex-col">
                                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white/20 rounded-lg w-fit mb-3">Top Project</span>
                                            <h3 className="text-lg font-black leading-tight mb-2 line-clamp-2">{post.title || 'Untitled Project'}</h3>
                                            <p className="text-xs text-white/70 line-clamp-2 mb-4 font-medium italic">"{post.content}"</p>
                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                                                        {post.author?.name?.charAt(0)}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{post.author?.name}</span>
                                                </div>
                                                <button className="text-[10px] font-black uppercase tracking-widest border-b border-white/40 pb-0.5">View Demo</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Main Feed */}
                    <div>
                        <div className="flex items-center justify-between mb-6 px-1">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Discussions & Updates</h2>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest cursor-pointer hover:bg-blue-500/5 px-3 py-1.5 rounded-xl transition-all">
                                <Filter size={12} /> Filter
                            </div>
                        </div>

                        {status === 'loading' ? (
                            <div className="space-y-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-white dark:bg-slate-900/30 h-48 rounded-[2rem] animate-pulse border border-slate-200 dark:border-white/5" />
                                ))}
                            </div>
                        ) : data?.pages.some((page) => page.length > 0) ? (
                            <div className="space-y-4">
                                {Array.isArray(data?.pages) && data.pages.map((page) => (
                                    Array.isArray(page) && page.map((post: any) => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            onAppreciate={(id) => handleInteraction(id, 'appreciate')}
                                            onBoost={(id) => handleInteraction(id, 'boost')}
                                            onDiscuss={() => {}}
                                        />
                                    ))
                                ))}

                                {hasNextPage && (
                                    <button
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        className="w-full py-6 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-500 transition-all"
                                    >
                                        {isFetchingNextPage ? 'Loading...' : 'More Posts • End of current updates'}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-slate-50 dark:bg-slate-950/20 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/5">
                                <div className="w-20 h-20 rounded-[2.5rem] bg-blue-500/10 flex items-center justify-center mb-6">
                                    <MessageCircle size={36} className="text-blue-500" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Build It and They Will Come</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[260px]">
                                    Be the first to showcase a project or start a discussion in this hub.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Leaderboard & Info */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Weekly Leaderboard */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Rocket size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Weekly Leaders</h3>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Top contributors this week</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {leaderboard.length > 0 ? leaderboard.slice(0, 5).map((user: any, idx: number) => (
                                <div key={user.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                                    <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center text-[10px] font-black">
                                        #{idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-900 dark:text-white truncate">{user.name}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{user.reputation} Rep Points</p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`} />
                                </div>
                            )) : (
                                <p className="text-[10px] text-slate-500 text-center py-4 font-bold uppercase tracking-widest">No activity yet</p>
                            )}
                        </div>

                        <button className="w-full mt-6 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95">
                            Show All Ranking
                        </button>
                    </div>

                    <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-600/20">
                        <h4 className="text-lg font-black mb-2 tracking-tight">Need a Mentor?</h4>
                        <p className="text-xs text-white/70 mb-6 font-medium leading-relaxed">Top leaders in this hub are open for project reviews and guidance.</p>
                        <button className="w-full py-4 bg-white text-blue-600 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg">Ask for Review</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HubFeedPage;
