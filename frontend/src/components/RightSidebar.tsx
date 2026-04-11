import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Users, GraduationCap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const RightSidebar = () => {
    const trending = [
        { id: 1, title: 'AI Research Initiative', signals: 142, type: 'Achievement' },
        { id: 2, title: 'Global Tech Summit 2026', signals: 89, type: 'Event' },
        { id: 3, title: 'Web3 Startup Grant', signals: 56, type: 'Opportunity' },
    ];

    const stats = [
        { label: 'Active Innovators', value: '2.4k', icon: Users, color: 'text-blue-500' },
        { label: 'Carrier Signals', value: '158', icon: Zap, color: 'text-amber-500' },
        { label: 'Placement Hub', value: '92%', icon: GraduationCap, color: 'text-emerald-500' },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* 📊 Institutional Signals */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp size={16} className="text-blue-600" />
                    <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Institutional Signals</h4>
                </div>

                <div className="space-y-4">
                    {trending.map((item) => (
                        <div key={item.id} className="group cursor-pointer">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.type}</p>
                            <h5 className="text-[13px] font-black text-slate-800 dark:text-slate-200 leading-tight group-hover:text-blue-500 transition-colors">
                                {item.title}
                            </h5>
                            <div className="flex items-center gap-1.5 mt-2">
                                <Zap size={10} className="text-amber-500 fill-amber-500" />
                                <span className="text-[10px] font-black text-slate-500">{item.signals} High-Signal Echoes</span>
                            </div>
                        </div>
                    ))}
                </div>

                <Link 
                    to="/discover"
                    className="flex items-center justify-between w-full mt-8 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl group hover:bg-blue-500/5 transition-colors"
                >
                    <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Explore Trends</span>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            {/* 📈 Community Metrics */}
            <div className="grid grid-cols-1 gap-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-slate-50 dark:bg-white/5 ${stat.color}`}>
                                <stat.icon size={16} />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* 📢 Platform Broadcast */}
            <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden shadow-xl shadow-blue-500/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <h4 className="text-white font-black text-lg tracking-tight mb-2 relative z-10">Pro Mentorship</h4>
                <p className="text-blue-100 text-[10px] font-medium leading-relaxed mb-6 opacity-80 relative z-10">
                    Connect with industry alumni and book documented career roadmap sessions.
                </p>
                <Link 
                    to="/mentorship"
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10 hover:scale-105 transition-transform"
                >
                    Book Now
                </Link>
            </div>
        </div>
    );
};

export default RightSidebar;
