import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, FileText, Sparkles, Briefcase, CreditCard, Target, Trello, Sliders, User, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const LeftSidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Client-facing navigation
    const clientItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/', color: 'text-blue-500' },
        { label: 'Requirements', icon: FileText, path: '/requirements', color: 'text-orange-500' },
        { label: 'AI Consultant', icon: Sparkles, path: '/consultant', color: 'text-indigo-500' },
        { label: 'Proposals', icon: Briefcase, path: '/proposals', color: 'text-rose-500' },
        { label: 'Payments', icon: CreditCard, path: '/payments', color: 'text-teal-500' },
    ];

    // Internal Ops navigation (hidden for client role)
    const opsItems = [
        { label: 'CRM Pipeline', icon: Target, path: '/crm', color: 'text-amber-500' },
        { label: 'Project Kanban', icon: Trello, path: '/projects', color: 'text-emerald-500' },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* 👤 Workspace Profile Card */}
            <div className="glass-card p-6 overflow-hidden relative group">
                <div className="relative">
                    <div className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-800 p-0.5 mb-4">
                        <div className="w-full h-full rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                            <User className="text-slate-400" size={20} />
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight truncate">
                        {user?.name || 'Enterprise User'}
                    </h3>
                    <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
                        {user?.organization?.name || 'Workspace Monolith'}
                    </p>

                    <div className="flex items-center justify-between py-4 border-y border-slate-100 dark:border-slate-800 gap-2">
                        <div className="text-center flex-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Role</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.role || 'MEMBER'}</p>
                        </div>
                        <div className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800" />
                        <div className="text-center flex-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Plan</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.organization?.subscriptionPlan || 'FREE'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🧭 Client Workspaces */}
            <div className="glass-card p-4">
                <p className="px-4 py-2 text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                    Client Desk
                </p>
                <div className="space-y-1">
                    {clientItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.label}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors group ${
                                    isActive ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                            >
                                <div className={`p-2 rounded-xl transition-colors ${
                                    isActive ? 'bg-blue-500/20' : 'bg-slate-100 dark:bg-white/5 group-hover:bg-slate-200 dark:group-hover:bg-white/10'
                                } ${item.color}`}>
                                    <item.icon size={18} />
                                </div>
                                <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${
                                    isActive ? 'text-slate-900 dark:text-white' : 'text-slate-650 dark:text-slate-350 group-hover:text-slate-950 dark:group-hover:text-white'
                                }`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* 🛠️ Internal Operations Desk (Hidden for clients) */}
            {user?.role !== 'CLIENT' && (
                <div className="glass-card p-4">
                    <p className="px-4 py-2 text-[9px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-widest">
                        Internal Ops
                    </p>
                    <div className="space-y-1">
                        {opsItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link 
                                    key={item.label}
                                    to={item.path}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors group ${
                                        isActive ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <div className={`p-2 rounded-xl transition-colors ${
                                        isActive ? 'bg-blue-500/20' : 'bg-slate-100 dark:bg-white/5 group-hover:bg-slate-200 dark:group-hover:bg-white/10'
                                    } ${item.color}`}>
                                        <item.icon size={18} />
                                    </div>
                                    <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${
                                        isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white'
                                    }`}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}

                        {/* Admin Config System */}
                        {user?.role === 'ADMIN' && (
                            <Link 
                                to="/admin"
                                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors group ${
                                    location.pathname === '/admin' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                            >
                                <div className={`p-2 rounded-xl transition-colors ${
                                    location.pathname === '/admin' ? 'bg-blue-500/20' : 'bg-slate-100 dark:bg-white/5'
                                } text-purple-500`}>
                                    <Sliders size={18} />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                                    Admin Panel
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <p className="px-6 text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] leading-relaxed">
                Enterprise OS &copy; 2026<br/>Modular Monolith Portal
            </p>
        </div>
    );
};

export default LeftSidebar;
