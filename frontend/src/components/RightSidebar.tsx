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
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp size={16} className="text-blue-600" />
                    <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Institutional Signals</h4>
                </div>

                <div className="space-y-4">
                    {trending.map((item) => (
                        <div key={item.id} className="group cursor-pointer">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.type}</p>
                            <h5 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-blue-500 transition-colors">
                                {item.title}
                            </h5>
                            <div className="flex items-center gap-1.5 mt-2">
                                <Zap size={10} className="text-amber-500 fill-amber-500" />
                                <span className="text-[10px] font-bold text-slate-500">{item.signals} High-Signal Echoes</span>
                            </div>
                        </div>
                    ))}
                </div>

                <Link 
                    to="/discover"
                    className="flex items-center justify-between w-full mt-6 p-3 bg-slate-50 dark:bg-white/5 rounded-xl group hover:bg-blue-500/5 transition-colors"
                >
                    <span className="text-[9px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Explore Trends</span>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            {/* 📈 Community Metrics */}
            <div className="grid grid-cols-1 gap-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="panel p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-slate-50 dark:bg-white/5 ${stat.color}`}>
                                <stat.icon size={16} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</span>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default RightSidebar;
