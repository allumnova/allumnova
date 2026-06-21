import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCollege } from '../contexts/CollegeContext';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, Users, MessageSquare, Star, Filter, Rocket, 
    Calendar, ShieldAlert, CircleDot, Info, Plus, Check, X,
    Layers, MapPin, Briefcase, Award, GraduationCap, ChevronRight
} from 'lucide-react';
import CreatePostModal from '../components/CreatePostModal';

const HubFeedPage = () => {
    const { hubId } = useParams<{ hubId: string }>();
    const { activeCollege } = useCollege();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [hubInfo, setHubInfo] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<string>('feed');
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

    // Sub-resources states
    const [members, setMembers] = useState<any[]>([]);
    const [circles, setCircles] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);

    // Circular Creation states
    const [showCircleModal, setShowCircleModal] = useState(false);
    const [circleName, setCircleName] = useState('');
    const [circleDesc, setCircleDesc] = useState('');

    // Dynamic Filter States for Members Directory
    const [memberSearch, setMemberSearch] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [batchFilter, setBatchFilter] = useState('');
    const [interestFilter, setInterestFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [nearbyFilter, setNearbyFilter] = useState(false);

    // Fetch primary Hub Details & Leaderboard
    useEffect(() => {
        const fetchHubData = async () => {
            try {
                const [hubRes, leaderboardRes] = await Promise.all([
                    api.get(`/environments/${hubId}`),
                    api.get(`/environments/${hubId}/leaderboard`).catch(() => ({ data: [] }))
                ]);
                setHubInfo(hubRes.data);
                setLeaderboard(leaderboardRes.data || []);
            } catch (err) {
                console.error('Failed to fetch hub data:', err);
            }
        };
        if (hubId) fetchHubData();
    }, [hubId]);

    // Fetch tab-specific data when tab changes
    useEffect(() => {
        if (!hubId) return;
        if (activeTab === 'members') {
            api.get(`/environments/${hubId}/members`)
                .then(res => setMembers(res.data || []))
                .catch(err => console.error(err));
        } else if (activeTab === 'circles') {
            api.get(`/environments/${hubId}/circles`)
                .then(res => setCircles(res.data || []))
                .catch(err => console.error(err));
        } else if (activeTab === 'events') {
            api.get(`/environments/${hubId}/events`)
                .then(res => setEvents(res.data || []))
                .catch(err => console.error(err));
        } else if (activeTab === 'admin') {
            api.get(`/environments/${hubId}/pending`)
                .then(res => setPendingRequests(res.data || []))
                .catch(err => console.error(err));
        }
    }, [hubId, activeTab]);

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

    const handleJoinRequest = async () => {
        try {
            await api.post(`/environments/${hubId}/join`, {});
            // Refresh details
            const hubRes = await api.get(`/environments/${hubId}`);
            setHubInfo(hubRes.data);
        } catch (err) {
            console.error('Failed to join environment:', err);
        }
    };

    const handleApproveMembership = async (membershipId: string) => {
        try {
            await api.patch(`/environments/membership/${membershipId}`, { status: 'APPROVED' });
            setPendingRequests(prev => prev.filter(r => r.id !== membershipId));
            // Refresh members if we have it loaded
            if (members.length > 0) {
                api.get(`/environments/${hubId}/members`).then(res => setMembers(res.data || []));
            }
        } catch (err) {
            console.error('Failed to approve membership:', err);
        }
    };

    const handleRejectMembership = async (membershipId: string) => {
        try {
            await api.patch(`/environments/membership/${membershipId}`, { status: 'REJECTED' });
            setPendingRequests(prev => prev.filter(r => r.id !== membershipId));
        } catch (err) {
            console.error('Failed to reject membership:', err);
        }
    };

    const handleCreateCircle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!circleName.trim()) return;
        try {
            await api.post(`/environments/${hubId}/circles`, {
                name: circleName,
                description: circleDesc,
                privacy: 'PUBLIC'
            });
            setCircleName('');
            setCircleDesc('');
            setShowCircleModal(false);
            // Reload circles
            const circlesRes = await api.get(`/environments/${hubId}/circles`);
            setCircles(circlesRes.data || []);
        } catch (err) {
            console.error('Failed to create circle:', err);
        }
    };

    // Filter members list based on chosen environment filters
    const filteredMembers = members.filter(m => {
        const user = m.user;
        if (!user) return false;

        // Search text matching name or department
        if (memberSearch && !user.name.toLowerCase().includes(memberSearch.toLowerCase()) && 
            !(user.department || '').toLowerCase().includes(memberSearch.toLowerCase())) {
            return false;
        }

        // Branch filter
        if (branchFilter && (user.department || '').toLowerCase() !== branchFilter.toLowerCase()) {
            return false;
        }

        // Batch filter
        if (batchFilter && (user.batch_year || '').toString() !== batchFilter) {
            return false;
        }

        // Role filter
        if (roleFilter && !(user.targetRole || '').toLowerCase().includes(roleFilter.toLowerCase())) {
            return false;
        }

        // Location / Nearby filter
        if (nearbyFilter && !user.location) {
            return false;
        }

        return true;
    });

    const isMember = hubInfo?.userStatus === 'APPROVED';
    const isAdmin = hubInfo?.userRole === 'ADMIN';
    const isPending = hubInfo?.userStatus === 'PENDING';
    const config = hubInfo?.config || {};

    const enabledModules = config.enabledModules || ['feed', 'members'];
    const memberFilters = config.memberFilters || [];
    const postTypes = config.postTypes || ['text'];
    const homeWidgets = config.homeWidgets || [];

    return (
        <div className="pb-24 pt-4 px-4 max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{hubInfo?.name || 'Loading Space...'}</h1>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                                    {hubInfo?.category || 'General'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                                {hubInfo?.description || 'Discover and connect with people in this space.'}
                            </p>
                            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3">
                                <span>{hubInfo?.memberCount || 0} Members</span>
                                <span>•</span>
                                <span>{hubInfo?.privacyLevel || 'PUBLIC'} SPACE</span>
                            </div>
                        </div>
                    </div>

                    {/* Join/Leave Button */}
                    <div>
                        {isMember ? (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700">
                                <Check size={14} /> Joined Member
                            </span>
                        ) : isPending ? (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-950 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl border border-amber-200/50 dark:border-amber-900/50 animate-pulse">
                                Pending Approval
                            </span>
                        ) : (
                            <button
                                onClick={handleJoinRequest}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                            >
                                Join Space
                            </button>
                        )}
                    </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex border-t border-slate-100 dark:border-slate-800/60 mt-6 pt-4 gap-2 overflow-x-auto no-scrollbar">
                    {enabledModules.includes('feed') && (
                        <button
                            onClick={() => setActiveTab('feed')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'feed' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            Discussions
                        </button>
                    )}
                    {enabledModules.includes('members') && (
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'members' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            Members ({hubInfo?.memberCount || 0})
                        </button>
                    )}
                    {enabledModules.includes('circles') && (
                        <button
                            onClick={() => setActiveTab('circles')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'circles' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            Circles
                        </button>
                    )}
                    {enabledModules.includes('events') && (
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'events' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            Events
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'about' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        About
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border border-red-200/50 dark:border-red-900/30 ${activeTab === 'admin' ? 'bg-red-500 text-white' : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'}`}
                        >
                            Admin panel
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    {/* TAB: FEED */}
                    {activeTab === 'feed' && (
                        <>
                            {/* Create Post Card (Visible to approved members only) */}
                            {isMember && (
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                                        +
                                    </div>
                                    <button
                                        onClick={() => setIsCreatePostOpen(true)}
                                        className="flex-1 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 border border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-500 rounded-xl px-4 py-2.5 text-xs text-left font-medium transition-colors"
                                    >
                                        Share an update or question in this space...
                                    </button>
                                </div>
                            )}

                            {/* Discussions Feed */}
                            <div>
                                {status === 'loading' ? (
                                    <div className="space-y-4">
                                        {[1, 2].map(i => (
                                            <div key={i} className="bg-white dark:bg-slate-900 h-40 rounded-xl animate-pulse border border-slate-200 dark:border-slate-800" />
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
                                                className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                                            >
                                                {isFetchingNextPage ? 'Loading...' : 'More Posts'}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <MessageSquare size={36} className="text-slate-300 dark:text-slate-600 mb-4" />
                                        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Feed is empty</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm">
                                            Be the first to share your thoughts, opportunities, or updates with this space!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* TAB: MEMBERS */}
                    {activeTab === 'members' && (
                        <div className="space-y-6">
                            {/* Filters Bar */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <input 
                                        type="text"
                                        placeholder="Search members..."
                                        value={memberSearch}
                                        onChange={e => setMemberSearch(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                    />

                                    {/* College filters */}
                                    {memberFilters.includes('branch') && (
                                        <input 
                                            type="text"
                                            placeholder="Filter by Department/Branch..."
                                            value={branchFilter}
                                            onChange={e => setBranchFilter(e.target.value)}
                                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                    )}
                                    {memberFilters.includes('batch') && (
                                        <input 
                                            type="text"
                                            placeholder="Filter by Batch Year (e.g. 2026)..."
                                            value={batchFilter}
                                            onChange={e => setBatchFilter(e.target.value)}
                                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                    )}

                                    {/* Professional Filters */}
                                    {memberFilters.includes('role') && (
                                        <input 
                                            type="text"
                                            placeholder="Filter by Role/Title..."
                                            value={roleFilter}
                                            onChange={e => setRoleFilter(e.target.value)}
                                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                    )}

                                    {/* Location filter */}
                                    {(memberFilters.includes('nearby_area') || memberFilters.includes('nearby')) && (
                                        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-350 cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={nearbyFilter}
                                                onChange={e => setNearbyFilter(e.target.checked)}
                                                className="rounded border-slate-200"
                                            />
                                            Show only with location set
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Members Grid */}
                            {filteredMembers.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {filteredMembers.map((m) => {
                                        const user = m.user;
                                        return (
                                            <div 
                                                key={m.id} 
                                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center overflow-hidden">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                                    ) : user.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-950 dark:text-white truncate">{user.name}</h4>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                                        {user.department || user.targetRole || 'Community Member'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
                                    No members match the search parameters.
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: CIRCLES */}
                    {activeTab === 'circles' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Subgroups & Circles</h3>
                                {isMember && (
                                    <button
                                        onClick={() => setShowCircleModal(true)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold rounded-xl transition-all"
                                    >
                                        <Plus size={14} /> Create Circle
                                    </button>
                                )}
                            </div>

                            {circles.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {circles.map((circle) => (
                                        <div key={circle.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                                                        <CircleDot size={18} />
                                                    </div>
                                                    <h4 className="text-sm font-bold text-slate-950 dark:text-white">{circle.name}</h4>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                                                    {circle.description || 'No description provided.'}
                                                </p>
                                            </div>
                                            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3 mt-1 text-[10px] text-slate-400 font-bold uppercase">
                                                <span>{circle._count?.members || 0} Members</span>
                                                <span className="text-blue-500 cursor-pointer hover:underline">Open Circle</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
                                    No subgroups have been created in this space yet.
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: EVENTS */}
                    {activeTab === 'events' && (
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Scheduled Events & Meetups</h3>

                            {events.length > 0 ? (
                                <div className="space-y-4">
                                    {events.map((event) => (
                                        <div key={event.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-start gap-4">
                                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20 flex flex-col items-center justify-center flex-shrink-0">
                                                <Calendar size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{event.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{event.description}</p>
                                                <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3">
                                                    <span className="flex items-center gap-1"><MapPin size={10} /> {event.location || 'Online'}</span>
                                                    <span>•</span>
                                                    <span>{new Date(event.event_date).toLocaleString()}</span>
                                                    <span>•</span>
                                                    <span>{event._count?.attendees || 0} Attendees</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
                                    No events scheduled in this space.
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: ABOUT */}
                    {activeTab === 'about' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Space Definition</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                                    {hubInfo?.description || 'This space does not have a formal description page.'}
                                </p>
                            </div>

                            {hubInfo?.location && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Location</h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-350">{hubInfo.location}</p>
                                </div>
                            )}

                            {hubInfo?.tags && hubInfo.tags.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Identifiers / Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {hubInfo.tags.map((t: string) => (
                                            <span key={t} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-500 uppercase">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: ADMIN PANEL */}
                    {activeTab === 'admin' && isAdmin && (
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Pending Membership Applications</h3>

                            {pendingRequests.length > 0 ? (
                                <div className="space-y-4">
                                    {pendingRequests.map((req) => (
                                        <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex justify-between items-center gap-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{req.user?.name}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{req.user?.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleApproveMembership(req.id)}
                                                    className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-xl transition-all"
                                                    title="Approve Member"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleRejectMembership(req.id)}
                                                    className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-xl transition-all"
                                                    title="Decline Member"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
                                    No pending applications for this space.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Widget columns */}
                <div className="lg:col-span-4 space-y-6">
                    {/* LEADERBOARD WIDGET */}
                    {homeWidgets.includes('leaderboard') && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Rocket size={16} className="text-amber-500" />
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Top Contributors</h3>
                            </div>
                            <div className="space-y-3">
                                {leaderboard.length > 0 ? leaderboard.slice(0, 5).map((user: any, idx: number) => (
                                    <div key={user.id} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-lg">
                                        <span className="text-[10px] font-black text-slate-400 w-4 text-center">#{idx + 1}</span>
                                        <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center text-[10px] font-black overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                            ) : user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">{user.reputation} Points</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-[10px] text-slate-400 text-center py-2">No activity records yet.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* GENERAL DETAILS WIDGET */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Info size={14} className="text-blue-500" />
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Space Protocol</h3>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                            Allumnova engine configures this environment dynamically based on verified local specifications.
                        </p>
                        <div className="space-y-2 text-[10px] font-bold text-slate-600 dark:text-slate-350 uppercase tracking-wide">
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span>Network Type</span>
                                <span className="text-slate-900 dark:text-white">{hubInfo?.category}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span>Privacy Protocol</span>
                                <span className="text-slate-900 dark:text-white">{hubInfo?.privacyType}</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span>Moderation</span>
                                <span className="text-emerald-500 font-black">ACTIVE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Post Modal Component */}
            {isCreatePostOpen && (
                <CreatePostModal
                    isOpen={isCreatePostOpen}
                    onClose={() => setIsCreatePostOpen(false)}
                    onSuccess={() => {
                        refetch();
                        setIsCreatePostOpen(false);
                    }}
                    initialData={{
                        environmentId: hubId
                    }}
                />
            )}

            {/* Create Circle Modal */}
            {showCircleModal && (
                <div className="fixed inset-0 z-[202] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowCircleModal(false)} />
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-slate-950 dark:text-white">Create New Circle</h3>
                            <button onClick={() => setShowCircleModal(false)} className="text-slate-400 hover:text-slate-650"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateCircle} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Circle Name</label>
                                <input
                                    type="text"
                                    required
                                    value={circleName}
                                    onChange={e => setCircleName(e.target.value)}
                                    placeholder="e.g. Kanpur Vijay Nagar Group"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</label>
                                <textarea
                                    value={circleDesc}
                                    onChange={e => setCircleDesc(e.target.value)}
                                    placeholder="What is this circle about?"
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none resize-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCircleModal(false)}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-xs font-bold rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HubFeedPage;
