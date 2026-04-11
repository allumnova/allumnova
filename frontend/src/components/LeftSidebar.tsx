import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Settings, Shield, Compass, BookOpen, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const LeftSidebar = () => {
    const { user, isAuthenticated } = useAuth();

    const navItems = [
        { label: 'Nova Scout', icon: Activity, path: '/scout', color: 'text-blue-500' },
        { label: 'Mentorship', icon: Compass, path: '/mentorship', color: 'text-emerald-500' },
        { label: 'Learning Lab', icon: BookOpen, path: '/profile?tab=learning', color: 'text-amber-500' },
        { label: 'Settings', icon: Settings, path: '/onboarding', color: 'text-slate-400' },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* 👤 Identity Card */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-blue-500/20 transition-colors" />
                
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[2px] mb-4">
                        <div className="w-full h-full rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-slate-400" size={24} />
                            )}
                        </div>
                    </div>
                    
                    <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight truncate">
                        {user?.name || 'Institutional Member'}
                    </h3>
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-4">
                        {user?.tierLevel || 'PULSE'} NEXUS
                    </p>

                    <div className="flex items-center justify-between py-4 border-y border-slate-100 dark:border-white/5 gap-2">
                        <div className="text-center flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Reputation</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{user?.reputationScore || 0}</p>
                        </div>
                        <div className="w-[1px] h-8 bg-slate-100 dark:bg-white/5" />
                        <div className="text-center flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Echoes</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">12</p>
                        </div>
                    </div>

                    <Link 
                        to={`/profile/${user?.id}`}
                        className="flex items-center justify-center gap-2 w-full mt-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95"
                    >
                        View Identity
                        <Shield size={12} />
                    </Link>
                </div>
            </div>

            {/* 🧭 Quick Nexus */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-4 shadow-sm">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <Link 
                            key={item.label}
                            to={item.path}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                        >
                            <div className={`p-2 rounded-xl bg-slate-100 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors ${item.color}`}>
                                <item.icon size={18} />
                            </div>
                            <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            <p className="px-6 text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] leading-relaxed">
                Allumnova Pro &copy; 2026<br/>Institutional Professional Network
            </p>
        </div>
    );
};

export default LeftSidebar;
