import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, UserPlus, Zap, Rocket, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Notification {
    id: string;
    type: 'appreciate' | 'discuss' | 'connect' | 'opportunity' | 'boost';
    user: {
        name: string;
        avatar?: string;
    };
    content?: string;
    time: string;
    isImportant?: boolean;
}

const NotificationPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const handleNotificationClick = (notif: Notification) => {
        if (notif.type === 'connect') {
            // For now, if we don't have senderId in the object, 
            // we can't navigate to the profile.
        } else if (['appreciate', 'discuss', 'boost'].includes(notif.type)) {
            // The id here is the reference_id (postId)
            navigate(`/feed?post=${notif.id}`);
        }
    };

    const handleAccept = async (requestId: string) => {
        try {
            await api.post('/social/connect/accept', { requestId });
            setNotifications(prev => (Array.isArray(prev) ? prev : []).filter((n: Notification) => n && n.id !== requestId));
        } catch (err) {
            console.error('Failed to accept request:', err);
        }
    };

    const handleDecline = async (requestId: string) => {
        try {
            await api.post('/social/connect/decline', { requestId });
            setNotifications(prev => (Array.isArray(prev) ? prev : []).filter((n: Notification) => n && n.id !== requestId));
        } catch (err) {
            console.error('Failed to decline request:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            // For now, since most are connect requests, we might not want to clear them 
            // but the UX says "Mark all as read". 
            // In a unified system, this would change their is_read status.
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/social/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className="pb-24 pt-6">
            <div className="flex items-center justify-between mb-8 px-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Notifications</h1>
                {notifications.length > 0 && (
                    <button 
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-[2rem] p-5 animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map((notif, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={clsx(
                                "group relative overflow-hidden rounded-[2rem] p-5 transition-all cursor-pointer",
                                notif.isImportant
                                    ? "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20"
                                    : "bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/80 shadow-sm dark:shadow-none"
                            )}
                        >
                            <div className="flex gap-4">
                                <div className={clsx(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                    notif.type === 'opportunity' && "bg-amber-500/20 text-amber-500",
                                    notif.type === 'appreciate' && "bg-rose-500/20 text-rose-500",
                                    notif.type === 'connect' && "bg-blue-500/20 text-blue-500",
                                    notif.type === 'discuss' && "bg-indigo-500/20 text-indigo-500"
                                )}>
                                    {notif.type === 'opportunity' && <Rocket size={20} />}
                                    {notif.type === 'appreciate' && <Heart size={20} fill="currentColor" />}
                                    {notif.type === 'connect' && <UserPlus size={20} />}
                                    {notif.type === 'discuss' && <MessageSquare size={20} />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate transition-colors">
                                            {notif.user?.name || 'User'}
                                        </h3>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">
                                            {notif.time}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                                        {notif.content}
                                    </p>

                                    {notif.type === 'connect' && (
                                        <div className="flex gap-2 mt-3">
                                            <button 
                                                onClick={() => handleAccept(notif.id)}
                                                className="flex-1 bg-blue-500 text-white text-[10px] font-bold py-2 rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                onClick={() => handleDecline(notif.id)}
                                                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {notif.isImportant && (
                                <div className="absolute top-0 right-0 p-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center text-center py-20 px-6"
                >
                    <div className="w-20 h-20 rounded-[2rem] bg-blue-500/10 flex items-center justify-center mb-6">
                        <Bell size={36} className="text-blue-500" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">No notifications yet</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[260px] leading-relaxed transition-colors">
                        When someone interacts with your posts or sends you a connection request, it will show up here.
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default NotificationPage;
