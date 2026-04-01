import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { Heart, MessageSquare, Share2, Rocket, Zap, UserPlus, FileText, Play, ChevronLeft, ChevronRight, Send, Calendar, Trophy, Briefcase, MoreHorizontal, Edit2, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import EditPostModal from './EditPostModal';

interface PostCardProps {
    post: Post;
    onAppreciate: (id: string) => void;
    onBoost: (id: string) => void;
    onDiscuss?: (id: string) => void;
    onUpdate?: (updatedPost: any) => void;
}

const typeConfigs = {
    opportunity: { label: 'Opportunity', color: 'text-blue-500', icon: 'Briefcase', bgColor: 'bg-blue-500/10' },
    event: { label: 'Event', color: 'text-emerald-500', icon: 'Calendar', bgColor: 'bg-emerald-500/10' },
    achievement: { label: 'Showcase', color: 'text-amber-500', icon: 'Trophy', bgColor: 'bg-amber-500/10' },
    general: { label: 'Thought', color: 'text-slate-500', icon: 'FileText', bgColor: 'bg-slate-500/10' }
};

const PostCard: React.FC<PostCardProps> = ({ post: initialPost, onAppreciate, onBoost, onDiscuss, onUpdate }) => {
    const [post, setPost] = useState(initialPost);
    const [isLiked, setIsLiked] = useState(false);
    const [showFire, setShowFire] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const { user: currentUser } = useAuth();

    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [localComments, setLocalComments] = useState<any[]>([]);

    // Sync local post state when prop changes
    useEffect(() => {
        setPost(initialPost);
    }, [initialPost]);

    // Sync local comments when post changes or comments are opened
    useEffect(() => {
        if (post.comments) {
            setLocalComments(post.comments);
        }
    }, [post.comments, showComments]);

    const handleAppreciate = () => {
        const newState = !isLiked;
        setIsLiked(newState);
        if (newState) {
            setShowFire(true);
            setTimeout(() => setShowFire(false), 1000);
        }
        onAppreciate(post.id);
    };

    const handleConnect = async () => {
        if (post.author.connectionStatus || connectionLoading) return;
        setConnectionLoading(true);
        try {
            await api.post('/social/connect', { receiverId: post.author.id });
            const updated: Post = {
                ...post,
                author: {
                    ...post.author,
                    connectionStatus: { status: 'pending', isSender: true }
                }
            };
            setPost(updated);
            if (onUpdate) onUpdate(updated);
        } catch (err) {
            console.error('Connect failed:', err);
        } finally {
            setConnectionLoading(false);
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/feed?post=${post.id}`;
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const res = await api.post('/feed/interact', { postId: post.id, type: 'discuss', content: commentText });
            setCommentText('');
            
            if (res.data.success && res.data.data) {
                const newComments = [res.data.data, ...localComments];
                setLocalComments(newComments);
                const updated = {
                    ...post,
                    comments: newComments,
                    _count: { ...post._count, comments: (post._count?.comments || 0) + 1 }
                };
                setPost(updated);
                if (onUpdate) onUpdate(updated);
            }
            
            if (onDiscuss) onDiscuss(post.id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/feed/post/${post.id}`);
            window.location.reload(); 
        } catch (err) {
            alert('Failed to delete post');
        }
    };

    const handleReport = async () => {
        const reason = window.prompt('Why are you reporting this post?');
        if (!reason) return;
        try {
            await api.post('/feed/report', { postId: post.id, reason });
            alert('Report submitted. Thank you.');
            setShowMenu(false);
        } catch (err) {
            alert('Failed to submit report');
        }
    };

    const [connectionLoading, setConnectionLoading] = useState(false);
    const isAuthor = currentUser?.id === post.author.id;
    const connectionStatus = post.author.connectionStatus;

    const getConnectLabel = () => {
        if (!connectionStatus) return 'Connect';
        if (connectionStatus.status === 'self') return 'You';
        if (connectionStatus.status === 'accepted') return 'Connected';
        if (connectionStatus.status === 'pending') return connectionStatus.isSender ? 'Pending' : 'Accept';
        return 'Connect';
    };

    const images = post.media?.filter(m => m.type === 'image') || [];
    const videos = post.media?.filter(m => m.type === 'video') || [];
    const pdfs = post.media?.filter(m => m.type === 'pdf') || [];

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const config = (typeConfigs as any)[post.post_type || 'general'] || typeConfigs.general;
    const icons: Record<string, any> = {
        Briefcase,
        Calendar,
        Trophy,
        FileText
    };
    const IconComponent = icons[config.icon] || FileText;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "bg-white dark:bg-slate-900/50 backdrop-blur-xl border rounded-[2rem] p-5 mb-4 relative overflow-hidden group transition-all duration-300 shadow-sm dark:shadow-none",
                post.post_type === 'opportunity' ? "border-blue-500/30 ring-1 ring-blue-500/10" : "border-slate-200 dark:border-white/5",
                post.post_type === 'achievement' ? "border-amber-500/30 shadow-lg shadow-amber-500/5" : ""
            )}
        >
            {/* Type Ribbon/Badge */}
            <div className={`absolute top-0 right-8 px-4 py-1 rounded-b-xl ${config.bgColor} ${config.color} flex items-center gap-1.5 border-x border-b border-inherit`}>
                <IconComponent size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{config.label}</span>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${post.author.id}`} className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-[2px] hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-bold text-xs text-slate-900 dark:text-white transition-colors overflow-hidden">
                            {post.author.avatar ? (
                                <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
                            ) : post.author.name.charAt(0)}
                        </div>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <Link to={`/profile/${post.author.id}`} className="font-semibold text-slate-900 dark:text-white text-sm transition-colors hover:text-blue-500">{post.author.name}</Link>
                            {post.author.is_verified && (
                                <CheckCircle2 size={14} className="text-blue-500 fill-blue-500/10" />
                            )}
                            <div className={clsx(
                                "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider",
                                getTierStyle(post.author.tierLevel || 'Echo')
                            )}>
                                {post.author.tierLevel || 'Echo'} • {post.author.reputationScore}
                            </div>
                        </div>
                        <p className="text-slate-400 text-[10px]">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleShare}
                        className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <Share2 size={16} />
                    </button>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
                        >
                            <MoreHorizontal size={18} />
                        </button>

                        <AnimatePresence>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden"
                                    >
                                        {isAuthor ? (
                                            <>
                                                <button 
                                                    onClick={() => { setShowEditModal(true); setShowMenu(false); }}
                                                    className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/5"
                                                >
                                                    <Edit2 size={14} /> Edit Post
                                                </button>
                                                <button 
                                                    onClick={handleDelete}
                                                    className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-rose-500 hover:bg-rose-500/5 transition-colors"
                                                >
                                                    <Trash2 size={14} /> Delete Post
                                                </button>
                                            </>
                                        ) : (
                                            <button 
                                                onClick={handleReport}
                                                className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-amber-500 hover:bg-amber-500/5 transition-colors"
                                            >
                                                <AlertTriangle size={14} /> Report Post
                                            </button>
                                        )}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <p className={clsx(
                    "text-slate-600 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden transition-colors mb-4",
                    post.post_type === 'achievement' ? "text-base font-medium italic" : ""
                )}>
                    {post.content}
                </p>

                {/* Media Rendering */}
                {images.length > 0 && (
                    <div className="relative rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-white/5 aspect-video">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={images[activeImageIndex].url}
                                src={images[activeImageIndex].url}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full object-cover"
                            />
                        </AnimatePresence>

                        {images.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all">
                                    <ChevronLeft size={16} />
                                </button>
                                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all">
                                    <ChevronRight size={16} />
                                </button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {images.map((_, i) => (
                                        <div key={i} className={clsx("w-1.5 h-1.5 rounded-full transition-all", i === activeImageIndex ? "bg-white w-4" : "bg-white/50")} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {videos.map(video => (
                    <div key={video.id} className="relative rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-white/5 aspect-video">
                        <video
                            src={video.url}
                            controls
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}

                {pdfs.map(pdf => (
                    <a
                        key={pdf.id}
                        href={pdf.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl mb-4 hover:border-blue-500 transition-all group/pdf"
                    >
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                            <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Document Resource</p>
                            <p className="text-[10px] text-slate-500 truncate">{pdf.url.split('/').pop()}</p>
                        </div>
                        <button className="text-blue-500 text-[10px] font-bold opacity-0 group-hover/pdf:opacity-100 transition-opacity">
                            View PDF
                        </button>
                    </a>
                ))}

                {renderMetadata(post)}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 transition-colors">
                <div className="flex items-center gap-6">
                    <button
                        onClick={handleAppreciate}
                        className={clsx(
                            "flex items-center gap-1.5 transition-all relative",
                            isLiked ? "text-rose-500" : "text-slate-400 dark:text-slate-400 hover:text-rose-400"
                        )}
                    >
                        <div className="relative">
                            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                            <AnimatePresence>
                                {showFire && (
                                    <motion.span
                                        initial={{ y: 0, opacity: 1, scale: 0.5 }}
                                        animate={{ y: -40, opacity: 0, scale: 2 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="absolute -top-2 left-0 text-xl pointer-events-none"
                                    >
                                        🔥
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                        <span className="text-[11px] font-medium">{post._count?.likes || 0}</span>
                    </button>

                    <button 
                        onClick={() => setShowComments(!showComments)}
                        className={clsx(
                            "flex items-center gap-1.5 transition-colors",
                            showComments ? "text-blue-500" : "text-slate-500 dark:text-slate-400 hover:text-blue-500"
                        )}
                    >
                        <MessageSquare size={18} />
                        <span className="text-[11px] font-medium">{post._count?.comments || 0}</span>
                    </button>

                    <button 
                        onClick={handleConnect}
                        disabled={!!connectionStatus || connectionLoading}
                        className={clsx(
                            "flex items-center gap-1.5 transition-colors",
                            connectionStatus?.status === 'accepted' ? "text-emerald-500" : 
                            connectionStatus?.status === 'pending' ? "text-blue-400 opacity-70" :
                            "text-slate-500 dark:text-slate-400 hover:text-blue-500"
                        )}
                    >
                        {connectionStatus?.status === 'accepted' ? <CheckCircle2 size={18} /> : <UserPlus size={18} />}
                        <span className="text-[11px] font-medium">{getConnectLabel()}</span>
                    </button>
                </div>

                <button
                    onClick={() => onBoost(post.id)}
                    className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                    <Zap size={18} className={post.metadata?.boostCount > 0 ? "fill-amber-500 text-amber-500" : ""} />
                    <span className="text-[11px] font-medium uppercase tracking-wider">
                        Boost {post.metadata?.boostCount > 0 && `(${post.metadata.boostCount})`}
                    </span>
                </button>
            </div>

            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5">
                            <form onSubmit={handleComment} className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl py-2 px-4 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                                <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl">
                                    <Send size={14} />
                                </button>
                            </form>

                            <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {localComments.length > 0 ? (
                                    localComments.map((comment: any) => (
                                        <div key={comment.id} className="flex gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                                                {comment.user?.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl p-2.5">
                                                <p className="text-[10px] font-bold text-slate-900 dark:text-white mb-0.5">{comment.user?.name}</p>
                                                <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-slate-400 text-center py-2">No comments yet. Start the discussion!</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <EditPostModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={(updated) => {
                    setPost(updated);
                    if (onUpdate) onUpdate(updated);
                    setShowEditModal(false);
                }}
                post={post}
            />
        </motion.div>
    );
};

const renderMetadata = (post: Post) => {
    if (!post.metadata || post.post_type === 'general') return null;

    const data = post.metadata as any;

    if (post.post_type === 'opportunity') {
        return (
            <div className="grid grid-cols-2 gap-4 mt-2 mb-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <div className="col-span-2 flex items-center gap-2">
                    <Briefcase size={14} className="text-blue-500" />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-blue-100">{data.role} @ {data.company}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{data.location || 'Remote'}</span>
                </div>
                {data.applyLink && (
                    <a href={data.applyLink} target="_blank" rel="noopener noreferrer" className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold shadow-lg shadow-blue-500/20 transition-all">
                        Apply Now
                    </a>
                )}
            </div>
        );
    }

    if (post.post_type === 'event') {
        return (
            <div className="flex flex-col gap-3 mt-2 mb-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex flex-col items-center justify-center border border-emerald-500/10">
                             <span className="text-[10px] font-bold text-emerald-500 uppercase">{new Date(data.eventDate).toLocaleString('default', { month: 'short' })}</span>
                             <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 leading-none">{new Date(data.eventDate || Date.now()).getDate()}</span>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{data.eventTitle}</h4>
                            <p className="text-[10px] text-slate-500">{data.location}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (post.post_type === 'achievement') {
        return (
            <div className="mt-2 mb-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border-2 border-amber-500/20">
                    <Trophy size={20} className="text-amber-500" />
                </div>
                <div className="flex-1">
                    <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">{data.title}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Issued by: {data.issuedBy}</p>
                </div>
            </div>
        );
    }

    return null;
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

export default PostCard;
