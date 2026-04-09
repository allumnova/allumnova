import React, { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCollege } from '../contexts/CollegeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { motion } from 'framer-motion';
import { Star, RefreshCcw, Zap, Briefcase, Calendar, Trophy, Rocket } from 'lucide-react';

const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-[2rem] p-5 mb-4 animate-pulse">
        <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-2 flex-1">
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-1/6" />
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
        </div>
    </div>
);

const FeedPage = () => {
    const { activeCollege } = useCollege();
    const navigate = useNavigate();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeType, setActiveType] = useState<string | null>(null);
    const [isProductive, setIsProductive] = useState(false);

    const postTypes = [
        { id: null, label: 'All Feed', icon: <Zap size={16} /> },
        { id: 'opportunity', label: 'Opportunities', icon: <Briefcase size={16} /> },
        { id: 'event', label: 'Events', icon: <Calendar size={16} /> },
        { id: 'achievement', label: 'Showcase', icon: <Trophy size={16} /> }
    ];

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey: ['feed', activeCollege?.id, activeType, isProductive],
        queryFn: async ({ pageParam }) => {
            try {
                const res = await api.get('/feed', {
                    params: {
                        cursor: pageParam,
                        limit: 10,
                        type: activeType,
                        productive: isProductive
                    }
                });
                return res.data || [];
            } catch (err) {
                console.error('Failed to fetch feed:', err);
                return [];
            }
        },
        getNextPageParam: (lastPage) => (Array.isArray(lastPage) && lastPage.length > 0) ? lastPage[lastPage.length - 1].id : undefined,
        enabled: !!activeCollege
    });

    const queryClient = useQueryClient();

    const handleInteraction = async (postId: string, type: 'appreciate' | 'boost') => {
        // Optimistic Update
        queryClient.setQueryData(['feed', activeCollege?.id, activeType], (oldData: any) => {
            if (!oldData || !Array.isArray(oldData.pages)) return oldData;
            return {
                ...oldData,
                pages: oldData.pages.map((page: any) =>
                    (Array.isArray(page) ? page : []).map((post: any) => {
                        if (post.id === postId) {
                            if (type === 'appreciate') {
                                const hasAppreciated = !post.hasAppreciated;
                                return {
                                    ...post,
                                    _count: { ...post._count, likes: Math.max(0, (post._count?.likes || 0) + (hasAppreciated ? 1 : -1)) },
                                    hasAppreciated
                                };
                            } else if (type === 'boost') {
                                const metadata = post.metadata || {};
                                return {
                                    ...post,
                                    metadata: { ...metadata, boostCount: (metadata.boostCount || 0) + 1 },
                                    hasBoosted: true
                                };
                            }
                        }
                        return post;
                    })
                )
            };
        });

        try {
            await api.post('/feed/interact', { postId, type });
        } catch (err) {
            console.error(`Failed to ${type}:`, err);
            // Rollback could be implemented here by refetching
            refetch();
        }
    };

    const onRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setTimeout(() => setIsRefreshing(false), 800);
    };

    if (!activeCollege) {
        return (
            <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
                <div className="w-20 h-20 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center mb-6 text-blue-500">
                    <Star size={40} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Build Your Identity</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 transition-colors">Select your institution to see opportunities and posts from your community.</p>
                <button 
                    onClick={() => navigate('/discover')}
                    className="bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-blue-500/20"
                >
                    Search College
                </button>
            </div>
        );
    }

    return (
        <div className="pb-24 pt-4 px-1">
            {/* Productive Mode Toggle */}
            <div className="flex items-center justify-between mb-8 bg-blue-600/5 dark:bg-blue-500/10 p-5 rounded-[2.5rem] border border-blue-500/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                        <Rocket size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Growth Mode</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Only High-Signal Content</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsProductive(!isProductive)}
                    className={`relative w-14 h-8 rounded-full transition-all duration-300 ${isProductive ? 'bg-blue-600' : 'bg-slate-200 dark:bg-white/10'}`}
                >
                    <motion.div 
                        animate={{ x: isProductive ? 26 : 4 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                    />
                </button>
            </div>

            {/* Type Navigation: "Four Ovals" */}
            <div className="flex gap-3 overflow-x-auto pb-6 px-1 no-scrollbar -mx-2 sm:mx-0">
                {postTypes.map((type) => (
                    <button
                        key={type.label}
                        onClick={() => setActiveType(type.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                            activeType === type.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20 scale-105'
                                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:border-blue-500/50'
                        }`}
                    >
                        {type.icon}
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Pull to refresh indicator */}
            <motion.div
                animate={{ height: isRefreshing ? 60 : 0, opacity: isRefreshing ? 1 : 0 }}
                className="flex items-center justify-center overflow-hidden"
            >
                <RefreshCcw className="text-blue-500 animate-spin" size={20} />
            </motion.div>

            {status === 'loading' ? (
                <>
                    <SkeletonCard />
                    <SkeletonCard />
                </>
            ) : (Array.isArray(data?.pages) && data.pages.some((page) => Array.isArray(page) && page.length > 0)) ? (
                <div className="space-y-4">
                    {Array.isArray(data?.pages) && data.pages.map((page) => (
                        Array.isArray(page) && page.map((post: any) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onAppreciate={(id) => handleInteraction(id, 'appreciate')}
                                onBoost={(id) => handleInteraction(id, 'boost')}
                                onDiscuss={() => {}} // No optimistic update for discuss yet as it's more complex (comments)
                            />
                        ))
                    ))}

                    <button
                        onClick={() => fetchNextPage()}
                        disabled={!hasNextPage || isFetchingNextPage}
                        className="w-full py-4 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        {isFetchingNextPage ? 'Loading more...' : hasNextPage ? 'Swipe up for more' : 'You are all caught up'}
                    </button>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center text-center py-16 px-6"
                >
                    <div className="w-20 h-20 rounded-[2rem] bg-blue-500/10 flex items-center justify-center mb-6">
                        <Star size={36} className="text-blue-500" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">No posts yet</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[260px] leading-relaxed transition-colors">
                        Be the first to post in your college community. Share updates, opportunities, and ideas!
                    </p>
                </motion.div>
            )}

        </div>
    );
};

export default FeedPage;
