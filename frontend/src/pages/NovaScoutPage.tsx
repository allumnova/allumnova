import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Search, Sparkles, Target, Zap, GraduationCap, ChevronRight, UserPlus, Fingerprint, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

const NovaScoutPage = () => {
    const { data: scoutData, isLoading } = useQuery({
        queryKey: ['nova-scout-research'],
        queryFn: async () => {
            const res = await api.get('/scout/research');
            return res.data.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-[2rem] bg-blue-600/10 flex items-center justify-center text-blue-600"
                >
                    <Fingerprint size={32} />
                </motion.div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Running Parallel Signal Analysis...</p>
            </div>
        );
    }

    const { peers, blueprints, archetype } = scoutData || {};

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 pb-32">
            {/* Scout Header */}
            <div className="relative mb-16 p-12 rounded-[3.5rem] bg-slate-900 border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                    <Fingerprint size={240} className="text-blue-500 rotate-12" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
                            <Activity className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Nova Scout</h1>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mt-1 ml-1">Pure Career Intelligence</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-4 rounded-3xl w-fit mb-8">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-bold text-slate-300">Target Role Identified: <span className="text-white">{archetype || 'Analyzing...'}</span></span>
                    </div>
                    <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
                        I've analyzed your portfolio signals. We found peer clusters that are 1 step ahead and alumni blueprints that match your trajectory.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* 1. Parallel Peer Clusters */}
                <div className="lg:col-span-2 space-y-10">
                    <section>
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Parallel Signals</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Peers on a similar journey</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {peers?.length > 0 ? peers.map((peer: any) => (
                                <motion.div 
                                    key={peer.id}
                                    whileHover={{ y: -5 }}
                                    className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 group transition-all"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-slate-100 dark:border-white/5">
                                            {peer.avatar ? <img src={peer.avatar} alt={peer.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-xl text-slate-400">{peer.name[0]}</div>}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white tracking-tight">{peer.name}</h3>
                                            <div className="px-2.5 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg mt-1 w-fit">
                                                {peer.reputationScore} Rep • {peer.tierLevel}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3 mb-6">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Focus</p>
                                        <div className="flex flex-wrap gap-2">
                                            {peer.interests?.slice(0, 3).map((int: string) => (
                                                <span key={int} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase">
                                                    {int}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <Link 
                                        to={`/profile/${peer.id}`}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all"
                                    >
                                        Inspect Path
                                        <ChevronRight size={14} />
                                    </Link>
                                </motion.div>
                            )) : (
                                <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5">
                                    <Target className="mx-auto text-slate-300 mb-4" size={48} />
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No parallel clusters found yet.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* 2. Alumni Blueprint Sidebar */}
                <div className="space-y-10">
                    <section>
                        <div className="flex items-center gap-3 mb-8 px-2">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <GraduationCap size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Alumni Blueprints</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">The path of proven success</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {blueprints?.map((alumni: any) => (
                                <Link 
                                    to={`/profile/${alumni.id}`}
                                    key={alumni.id}
                                    className="block p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-[2.5rem] group hover:border-blue-500/50 transition-all"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            {alumni.avatar ? <img src={alumni.avatar} alt={alumni.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">{alumni.name[0]}</div>}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{alumni.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{alumni.experience?.[0]?.company || 'Verified Professional'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Blueprint Strength</p>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Agent Tip */}
                    <div className="p-8 rounded-[2.5rem] bg-blue-600 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
                        <Zap className="absolute -bottom-4 -right-4 p-0 opacity-20" size={120} />
                        <h4 className="text-lg font-black uppercase tracking-tight mb-2">Scout Insights</h4>
                        <p className="text-sm font-medium leading-relaxed text-white/80">
                            "The Technical Architect" archetype is trending in the SDE-AI Hub. Following {blueprints?.[0]?.name}'s path is recommended for 3.5x faster reputation growth.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NovaScoutPage;
