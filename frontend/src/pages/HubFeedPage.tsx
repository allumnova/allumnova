import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCollege } from '../contexts/CollegeContext';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, MessageCircle, Star } from 'lucide-react';

const HubFeedPage = () => {
    const { hubId } = useParams<{ hubId: string }>();
    const { activeCollege } = useCollege();
    const navigate = useNavigate();
    const [hubInfo, setHubInfo] = useState<any>(null);

    // Fetch Hub Details
    useEffect(() => {
        const fetchHub = async () => {
            try {
                const res = await api.get(`/environments/${hubId}`);
                setHubInfo(res.data);
            } catch (err) {
                console.error('Failed to fetch hub:', err);
            }
        };
        if (hubId) fetchHub();
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
        <div className="pb-24 pt-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 hover:text-blue-500 transition-all"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{hubInfo?.name || 'Hub Feed'}</h1>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                        <Users size={12} /> {hubInfo?._count?.members || 0} Members • {hubInfo?.type || 'Community'}
                    </p>
                </div>
            </div>

            {hubInfo?.description && (
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-6 mb-8">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                        "{hubInfo.description}"
                    </p>
                </div>
            )}

            {/* Feed */}
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
                            className="w-full py-4 text-slate-500 text-xs font-bold uppercase tracking-widest"
                        >
                            {isFetchingNextPage ? 'Loading...' : 'More Posts'}
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 px-6">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-blue-500/10 flex items-center justify-center mb-6">
                        <MessageCircle size={36} className="text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Silence is golden?</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[260px]">
                        No posts in this hub yet. Be the first to start the conversation!
                    </p>
                </div>
            )}
        </div>
    );
};

export default HubFeedPage;
